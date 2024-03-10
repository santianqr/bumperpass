import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { hash, compare } from "bcrypt";
import { NextResponse } from "next/server";

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
    name: z.string().min(2, { message: "Type at least 2 characters." }),
    state: z.string({ required_error: "Please select a valid option." }),
    unit: z.string().optional(),
    vin: z
      .string({ required_error: "Must be just numbers." })
      .min(3, { message: "Type just 3 numbers." })
      .max(3, { message: "Type just 3 numbers." }),
    phone: z.string().optional(),
    confirmPassword: z.string(),
    middleName: z.string().optional(),
    city: z.string().min(2, { message: "Type at least 2 characters." }),
    zipCode: z
      .string()
      .refine((value) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value), {
        message: "Must be a valid zip code on USA.",
      }),
    currentPlate: z
      .string()
      .min(2, { message: "Type at least 2 characters." })
      .max(7, { message: "Type at most 7 characters." }),
    lastName: z.string().min(2, { message: "Type at least 2 characters." }),
    street: z.string().min(2, { message: "Type at least 2 characters." }),
    terms: z.boolean().default(false),
    suscribe: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.terms === true, {
    message: "Please accept the terms and conditions.",
    path: ["terms"],
  });

const FormSchemaAccount = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  state: z.string(),
  phone: z.string().optional(),
  city: z.string().min(2),
  zipCode: z
    .string()
    .refine((value) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value))
    .optional(),
  currentPlate: z.string().min(2).max(7),
  street: z.string().min(2),
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

export const funcRouter = createTRPCRouter({
  createAccount: publicProcedure
    .input(FormSchemaRegister)
    .mutation(async ({ ctx, input }) => {
      try {
        const data = FormSchemaRegister.parse(input);

        const existingEmail = await ctx.db.user.findUnique({
          where: { email: data.email },
        });
        if (existingEmail) {
          return NextResponse.json({
            user: null,
            message: "Email already exists.",
            status: 409,
          });
        }

        const existingPlate = await ctx.db.user.findUnique({
          where: { currentPlate: data.currentPlate },
        });
        if (existingPlate) {
          return NextResponse.json({
            user: null,
            message: "Plate already exists.",
            status: 409,
          });
        }

        const existingVin = await ctx.db.user.findUnique({
          where: { vin: data.vin },
        });
        if (existingVin) {
          return NextResponse.json({
            user: null,
            message: "VIN already exists.",
            status: 409,
          });
        }

        const hashedPassword = await hash(data.password, 10);

        return await ctx.db.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone,
            city: data.city,
            zipCode: data.zipCode,
            currentPlate: data.currentPlate,
            vin: data.vin,
            state: data.state,
            street: data.street,
            unit: data.unit,
            suscribe: data.suscribe,
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  resetPassword: protectedProcedure
    .input(FormSchemaResetPassword)
    .mutation(async ({ ctx, input }) => {
      try {
        const data = FormSchemaResetPassword.parse(input);

        const person = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });
        if (!person) {
          return NextResponse.json({
            user: null,
            message: "Person doesnt exists.",
            status: 409,
          });
        }

        if (person.password !== null) {
          const passwordMatch = await compare(
            data.currentPassword,
            person.password,
          );
          if (!passwordMatch) {
            return NextResponse.json({
              user: null,
              message: "Passwords not matched.",
              status: 409,
            });
          }
        }

        const updateData = {
          password: data.newPassword,
        };

        return ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: updateData,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  updateSuscribe: protectedProcedure
    .input(FormSchemaSuscribe)
    .mutation(async ({ ctx, input }) => {
      try {
        const data = FormSchemaSuscribe.parse(input);

        const person = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });
        if (!person) {
          return NextResponse.json({
            user: null,
            message: "Person doesnt exists.",
            status: 409,
          });
        }

        const updateData = {
          suscribe: data.suscribe,
        };

        return ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: updateData,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  getSuscribe: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        suscribe: true,
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
        zipCode: true,
        currentPlate: true,
      },
    });
  }),

  updateAccount: protectedProcedure
    .input(FormSchemaAccount)
    .mutation(async ({ ctx, input }) => {
      try {
        const data = FormSchemaAccount.parse(input);

        if (data.currentPlate) {
          const existingPlate = await ctx.db.user.findFirst({
            where: { currentPlate: data.currentPlate },
          });
          if (existingPlate && existingPlate.id !== ctx.session.user.id) {
            return NextResponse.json({
              user: null,
              message: "Email already exists.",
              status: 409,
            });
          }
        }

        return ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),


});
