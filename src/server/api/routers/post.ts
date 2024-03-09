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
  email: z
    .string({ required_error: "Please type a valid email." })
    .email()
    .optional(),
  firstName: z
    .string()
    .min(2, { message: "Type at least 2 characters." })
    .optional(),
  state: z
    .string({ required_error: "Please select a valid option." })
    .optional(),
  phone: z.string().optional(),
  city: z
    .string()
    .min(2, { message: "Type at least 2 characters." })
    .optional(),
  zipCode: z
    .string()
    .refine((value) => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value), {
      message: "Must be a valid zip code on USA.",
    })
    .optional(),
  currentPlate: z
    .string()
    .min(2, { message: "Type at least 2 characters." })
    .max(7, { message: "Type at most 7 characters." })
    .optional(),
  numberNameStreet: z
    .string()
    .min(2, { message: "Type at least 2 characters." })
    .optional(),
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
      return ctx.db.person.create({
        data: FormSchemaRegister.parse(input),
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
      // Parsea el input con el esquema
      const data = FormSchemaAccount.parse(input);

      // Actualiza la persona en la base de datos
      return ctx.db.person.update({
        where: { id: "1" },
        data,
      });
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
