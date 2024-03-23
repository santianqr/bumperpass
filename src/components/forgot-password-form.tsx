"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormControl,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";

const FormSchema = z.object({
  password: z
    .string()
    .refine((value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(value),
    ),
  token: z.string(),
});

type Props = {
  token: string;
};

export function ForgotPasswordForm({ token }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      token: token,
    },
  });

  const updatePassword = api.func.updatePassword.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    updatePassword.mutate(data, {
      onSuccess() {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
      },
      onError(error) {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  }
  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="">Reset password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="self-end rounded-3xl bg-[#E62534] hover:bg-[#E62534]/90"
              disabled={updatePassword.isLoading}
            >
              {updatePassword.isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
