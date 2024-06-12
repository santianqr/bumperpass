"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { ForgotPasswordFormSchema } from "@/lib/formSchemas";

type Props = {
  token: string;
};

export function ForgotPasswordForm({ token }: Props) {
  const form = useForm<z.infer<typeof ForgotPasswordFormSchema>>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      token: token,
    },
  });

  const updatePassword = api.func.updatePassword.useMutation();

  function onSubmit(data: z.infer<typeof ForgotPasswordFormSchema>) {
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
    <Card >
      <CardHeader >
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
