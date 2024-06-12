import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SettingsNotificationFormSchema = z.object({
  suscribe: z.boolean(),
});

export const SettingsFormSchema = z
  .object({
    currentPassword: z
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
    newPassword: z
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

function countSymbols(s: string) {
return [...s].length;
}

const emojis = ["🖐", "❤", "⭐", "➕"];

export const SearchFormSchema = z.object({
    vehicleType: z
      .string({
        required_error: "Please select a valid option.",
      })
      .refine((value) => value === "AUTO" || value === "MOTO", {
        message: "Vehicle type must be either 'auto' or 'motorcycle'.",
      }),
    state: z.string({ required_error: "Please select a valid option." }),
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
  
