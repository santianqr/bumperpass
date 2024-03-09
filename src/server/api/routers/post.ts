import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const FormSchemaRegister = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .refine((value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(
          value,
        ),
      ),
    firstName: z.string().min(2),
    state: z.string(),
    unitNumber: z.string().optional(),
    vin: z.string().min(3).max(3),
    phone: z.string().optional(),
    confirmPassword: z.string(),
    middleName: z.string().optional(),
    city: z.string().min(2),
    zipCode: z
      .string()
      .refine((value) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value)),
    currentPlate: z.string().min(2).max(7),
    lastName: z.string().min(2),
    numberNameStreet: z.string().min(2),
    terms: z.boolean().default(false),
    suscribe: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  })
  .refine((data) => data.terms === true, {
    path: ["terms"],
  });

const FormSchemaAccount = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(2).optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().min(2).optional(),
  zipCode: z
    .string()
    .refine((value) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value))
    .optional(),
  currentPlate: z.string().min(2).max(7).optional(),
  numberNameStreet: z.string().min(2).optional(),
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

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  created: publicProcedure
    .input(FormSchemaRegister)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parsea el input con el esquema
        const data = FormSchemaRegister.parse(input);

        // Verifica si el email ya existe en la base de datos
        const existingEmail = await ctx.db.person.findUnique({
          where: { email: data.email },
        });
        if (existingEmail) {
          throw new Error("El email ya existe");
        }

        // Verifica si currentPlate ya existe en la base de datos
        const existingPlate = await ctx.db.person.findUnique({
          where: { currentPlate: data.currentPlate },
        });
        if (existingPlate) {
          throw new Error("La placa actual ya existe");
        }

        // Verifica si vin ya existe en la base de datos
        const existingVin = await ctx.db.person.findUnique({
          where: { vin: data.vin },
        });
        if (existingVin) {
          throw new Error("El VIN ya existe");
        }

        // Crea la persona en la base de datos
        return await ctx.db.person.create({
          data,
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
        // Parsea el input con el esquema
        const data = FormSchemaResetPassword.parse(input);

        // Obtiene la persona de la base de datos
        const person = await ctx.db.person.findUnique({
          where: { id: "1" },
        });
        if (!person) throw new Error("No se encontró la persona");
        // Comprueba si la contraseña actual es correcta
        if (person.password !== data.currentPassword) {
          throw new Error("La contraseña actual es incorrecta");
        }

        // Crea un nuevo objeto con los campos que deseas actualizar
        const updateData = {
          password: data.newPassword,
          confirmPassword: data.confirmPassword,
        };

        // Actualiza la persona en la base de datos
        return ctx.db.person.update({
          where: { id: "1" },
          data: updateData,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  updateSuscribe: protectedProcedure
    .input(FormSchemaSuscribe) // Asume que tienes un esquema de validación para suscribe
    .mutation(async ({ ctx, input }) => {
      try {
        // Parsea el input con el esquema
        const data = FormSchemaSuscribe.parse(input);

        // Obtiene la persona de la base de datos
        const person = await ctx.db.person.findUnique({
          where: { id: "1" },
        });
        if (!person) throw new Error("No se encontró la persona");

        // Crea un nuevo objeto con el campo que deseas actualizar
        const updateData = {
          suscribe: data.suscribe,
        };

        // Actualiza la persona en la base de datos
        return ctx.db.person.update({
          where: { id: "1" },
          data: updateData,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  getSuscribe: protectedProcedure.query(({ ctx }) => {
    return ctx.db.person.findUnique({
      where: { id: "1" },
      select: {
        suscribe: true,
      },
    });
  }),

  getAccount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.person.findUnique({
      where: { id: "1" },
      select: {
        firstName: true,
        email: true,
        phone: true,
        state: true,
        city: true,
        numberNameStreet: true,
        zipCode: true,
        currentPlate: true,
      },
    });
  }),

  updateAccount: protectedProcedure
    .input(FormSchemaAccount)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parsea el input con el esquema
        const data = FormSchemaAccount.parse(input);

        // Si currentPlate está presente en los datos de entrada, verifica si ya existe en la base de datos
        if (data.currentPlate) {
          const existingPlate = await ctx.db.person.findFirst({
            where: { currentPlate: data.currentPlate },
          });
          if (existingPlate && existingPlate.id !== "1") {
            throw new Error("La placa actual ya existe");
          }
        }

        // Actualiza la persona en la base de datos
        return ctx.db.person.update({
          where: { id: "1" },
          data,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
