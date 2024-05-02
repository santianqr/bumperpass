import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { hash, compare } from "bcrypt";
import { EmailVerify } from "@/components/email-verify";
import { EmailForgotPassword } from "@/components/email-forgot-password";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const FormSchemaRegister = z
  .object({
    email: z.string({ required_error: "Please type a valid email." }).email(),
    password: z
      .string()
      .refine(
        (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(
            value,
          ),
        {
          message:
            "Password must have 8 characters, one mayus, one symbol and one number.",
        },
      ),
    terms: z.boolean().default(false),
    suscribe: z.boolean().default(true),
  })
  .refine((data) => data.terms === true, {
    message: "Please accept the terms and conditions.",
    path: ["terms"],
  });

const FormSchemaFinishRegister = z.object({
  name: z.string({ required_error: "Please type your name." }),
  address: z.string().optional(),
  city: z.string({ required_error: "Please type your city." }),
  state: z.string({ required_error: "Please select a valid option." }),
  phone: z.string().optional(),
  vin: z
    .string({ required_error: "Please type your VIN." })
    .min(3, { message: "VIN must have 3 characters." })
    .max(3, { message: "VIN must have 3 characters." }),
  currentPlate: z.string({ required_error: "Please type your current plate." }),
  token: z.string(),
});

const FormSchemaAccount = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  state: z.string(),
  phone: z.string().optional(),
  city: z.string().min(2),
  currentPlate: z.string().min(2).max(7),
  street: z.string().min(2),
  vin: z.string().min(3).max(3),
});

const FormSchemaResetPassword = z
  .object({
    currentPassword: z
      .string()
      .refine((value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(
          value,
        ),
      ),
    newPassword: z
      .string()
      .refine((value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(
          value,
        ),
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
  });

const FormSchemaSuscribe = z.object({
  suscribe: z.boolean(),
});

const FormSchemaForgotPassword = z.object({
  email: z.string().email(),
});

const FormSchemaUpdatePassword = z.object({
  password: z
    .string()
    .refine((value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(value),
    ),
  token: z.string(),
});

type SearchCarApiResponse = {
  message: string;
  status: number;
};


export const funcRouter = createTRPCRouter({
  createAccount: publicProcedure
    .input(FormSchemaRegister)
    .mutation(async ({ ctx, input }) => {
      const data_user = FormSchemaRegister.parse(input);
      const resend = new Resend(process.env.RESEND_API_KEY);

      const existingEmail = await ctx.db.user.findUnique({
        where: { email: data_user.email },
      });
      if (existingEmail) {
        throw new Error("Email already exists.");
      }

      const hashedPassword = await hash(data_user.password, 10);
      const token = randomBytes(32).toString("base64url");
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await resend.emails.send({
          from: "Bumperpass Contact <contact@bumperpass.com>",
          to: data_user.email,
          subject: "Email verification.",
          text: "Email verification.",
          react: EmailVerify({ name: "New Bumperpass user", token: token }),
        });
      } catch (error) {
        throw new Error("Error sending email.");
      }

      return ctx.db.user.create({
        data: {
          email: data_user.email,
          password: hashedPassword,
          suscribe: data_user.suscribe,
          tokens: {
            create: {
              token: token,
              expires: expiryDate,
            },
          },
        },
      });
    }),

  finishRegister: publicProcedure
    .input(FormSchemaFinishRegister)
    .mutation(async ({ ctx, input }) => {
      const data = FormSchemaFinishRegister.parse(input);

      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token: data.token },
      });

      if (!verificationToken) {
        throw new Error("Invalid token");
      }

      const response = await fetch("http://localhost:3000/api/search-car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plate: data.currentPlate,
          vin: data.vin,
        }),
      });

      const result = (await response.json()) as SearchCarApiResponse;

      if (result.message !== "OK") {
        throw new Error("3 last digits of VIN or Plate is not valid.");
      }


      await ctx.db.user.update({
        where: { id: verificationToken.identifier },
        data: {
          name: data.name,
          street: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          vin: data.vin,
          currentPlate: data.currentPlate,
        },
      });

      return ctx.db.verificationToken.deleteMany({
        where: { identifier: verificationToken.identifier },
      });
    }),

  resetPassword: protectedProcedure
    .input(FormSchemaResetPassword)
    .mutation(async ({ ctx, input }) => {
      const data = FormSchemaResetPassword.parse(input);

      const person = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { password: true },
      });

      if (!person) {
        throw new Error("Person doesn't exists.");
      }

      if (person.password !== null) {
        const passwordMatch = await compare(
          data.currentPassword,
          person.password,
        );
        if (!passwordMatch) {
          throw new Error("Password doesn't match.");
        }
      }

      const hashedPassword = await hash(data.newPassword, 10);

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      });
    }),

  updateSuscribe: protectedProcedure
    .input(FormSchemaSuscribe)
    .mutation(async ({ ctx, input }) => {
      const data = FormSchemaSuscribe.parse(input);

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          suscribe: data.suscribe,
        },
      });
    }),

  getSuscribe: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        suscribe: true,
      },
    });
  }),

  getPlates: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customPlate.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        plate: true,
      },
    });
  }),

  getAccount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        state: true,
        city: true,
        street: true,
        currentPlate: true,
        vin: true,
      },
    });
  }),

  getSearch: protectedProcedure.query(({ ctx }) => {
    return ctx.db.plate.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        plate: true,
        available: true,
        vehicleType: true,
        state: true,
        createdAt: true,
      },
    });
  }),

  getVG: protectedProcedure.query(({ ctx }) => {
    return ctx.db.customPlate.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        plate: true,
        createdAt: true,
        description: true,
      },
    });
  }),

  getCar: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        currentPlate: true,
        vin: true,
      },
    });
  }),

  updateAccount: protectedProcedure
    .input(FormSchemaAccount)
    .mutation(async ({ ctx, input }) => {
      const data = FormSchemaAccount.parse(input);

      const response = await fetch("http://localhost:3000/api/search-car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plate: data.currentPlate,
          vin: data.vin,
        }),
      });

      const result = (await response.json()) as SearchCarApiResponse;

      if (result.message !== "OK") {
        throw new Error("3 last digits of VIN or Plate is not valid.");
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data,
      });
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.user.delete({
      where: { id: ctx.session.user.id },
    });
  }),

  forgotPassword: publicProcedure
    .input(FormSchemaForgotPassword)
    .mutation(async ({ ctx, input }) => {
      const data_user = FormSchemaForgotPassword.parse(input);

      const resend = new Resend(process.env.RESEND_API_KEY);

      const existingUser = await ctx.db.user.findUnique({
        where: { email: data_user.email },
      });
      if (!existingUser) {
        throw new Error("Email doesn't exists.");
      }
      const token = randomBytes(32).toString("base64url");
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await resend.emails.send({
          from: "Bumperpass Contact <contact@bumperpass.com>",
          to: existingUser.email ?? "",
          subject: "Password Reset",
          text: "Password Reset",
          react: EmailForgotPassword({
            name: existingUser.name ?? "",
            token: token,
          }),
        });
      } catch (error) {
        throw new Error("Error sending email.");
      }

      return ctx.db.verificationToken.create({
        data: {
          token: token,
          expires: expiryDate,
          identifier: existingUser.id,
        },
      });
    }),

  updatePassword: publicProcedure
    .input(FormSchemaUpdatePassword)
    .mutation(async ({ ctx, input }) => {
      const data = FormSchemaUpdatePassword.parse(input);

      if (data.token) {
        const verificationToken = await ctx.db.verificationToken.findUnique({
          where: {
            token: data.token,
          },
          include: {
            user: true,
          },
        });

        if (!verificationToken) {
          throw new Error("Invalid token.");
        }

        if (new Date() > verificationToken.expires) {
          throw new Error("Token expired.");
        }

        const hashedPassword = await hash(data.password, 10);

        await ctx.db.verificationToken.deleteMany({
          where: {
            user: {
              id: verificationToken.user.id,
            },
          },
        });

        return ctx.db.user.update({
          where: {
            id: verificationToken.user.id,
          },
          data: {
            password: hashedPassword,
          },
        });
      } else {
        throw new Error("No token provided.");
      }
    }),

  savePlate: protectedProcedure
    .input(
      z.object({
        plate: z.string(),
        available: z.boolean(),
        vehicleType: z.string(),
        state: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existingPlate = await ctx.db.plate.findUnique({
        where: { plate: input.plate },
      });

      if (existingPlate) {
        return ctx.db.plate.update({
          where: { plate: input.plate },
          data: {
            available: input.available,
            userId: userId,
            createdAt: new Date(),
            vehicleType: input.vehicleType,
            state: input.state,
          },
        });
      } else {
        return ctx.db.plate.create({
          data: {
            plate: input.plate,
            available: input.available,
            userId: userId,
            createdAt: new Date(),
            vehicleType: input.vehicleType,
            state: input.state,
          },
        });
      }
    }),

  saveValidPlates: protectedProcedure
    .input(
      z.object({
        plates: z.array(z.string()),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const createdPlates = await Promise.all(
        input.plates.map((plate) =>
          ctx.db.customPlate.create({
            data: {
              plate,
              userId,
              createdAt: new Date(),
              description: input.description,
            },
          }),
        ),
      );

      return createdPlates;
    }),
});
