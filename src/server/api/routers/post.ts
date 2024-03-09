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

const emojis = ["🖐", "❤", "⭐", "➕"];

function countSymbols(s: string) {
  return [...s].length;
}

const FormSchemaSearch = z.object({
  vehicleType: z
    .string({
      required_error: "Please select a valid option.",
    })
    .refine((value) => value === "AUTO" || value === "MOTO", {
      message: "Vehicle type must be either 'auto' or 'motorcycle'.",
    }),

  state: z
    .string({ required_error: "Please select a valid option." })
    .optional(),

  personalizedPlate: z
    .string()
    .refine((value) => countSymbols(value) >= 2, {
      message: "Plates must be at least 2 characters.",
    })
    .refine((value) => countSymbols(value) <= 7, {
      message: "Plates must be at most 7 characters.",
    })
    .refine((value) => !value.includes("0"), {
      message: "The plate cannot contain the number 0.",
    })
    .refine(
      (value) => emojis.filter((emoji) => value.includes(emoji)).length <= 1,
      {
        message: "The plate cannot contain more than one emoji.",
      },
    )
    .refine((value) => !value.includes("//"), {
      message: "The plate cannot contain consecutive half spaces.",
    })
    .refine((value) => /^[a-zA-Z1-9🖐❤⭐➕/ ]*$/.test(value), {
      message:
        "The plate can only contain letters from the American alphabet, numbers from 1 to 9, one of the four emojis, spaces or half spaces.",
    }),
});

type ResponseData = {
  message: string;
  status: number;
};

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

  search: publicProcedure.input(FormSchemaSearch).query(async ({ input }) => {
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const resSearch: ResponseData = (await res.json()) as ResponseData;
      return resSearch.message;
    } catch (error) {
      console.error(error);
      return "Error";
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
