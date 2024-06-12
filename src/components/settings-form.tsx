"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { SettingsFormSchema } from "@/lib/formSchemas";

export function SettingsForm() {
  const form = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {},
  });

  const updatePassword = api.func.resetPassword.useMutation();

  function onSubmit(data: z.infer<typeof SettingsFormSchema>) {
    updatePassword.mutate(data, {
      onSuccess() {
        toast({
          title: "Password updated!",
          description: "Your password has been updated successfully.",
        });
        form.reset(
          {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
          {
            keepValues: false,
            keepErrors: false,
          },
        );
      },
      onError(error) {
        toast({
          title: "Error updating password",
          description: error.message,
        });
      },
    });
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="sm:w-2/6 space-y-2 text-gray-500"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
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
          className="w-full bg-[#E62534] hover:bg-[#E62534]/90"
          disabled={updatePassword.isLoading}
        >
          {updatePassword.isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            "Change"
          )}
        </Button>
      </form>
    </Form>
  );
}
