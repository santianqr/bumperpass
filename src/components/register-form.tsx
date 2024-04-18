"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";
import { Icons } from "@/components/icons";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";

const FormSchema = z
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

export function RegisterForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      suscribe: false,
      terms: true,
    },
  });

  const createAccount = api.func.createAccount.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createAccount.mutate(data, {
      onSuccess() {
        toast({
          title: "Account created!",
          description: "Please, check your email for the validation.",
        });
      },
      onError(error) {
        toast({
          title: "Error creating account",
          description: error.message,
        });
      },
    });
  }

  return (
    <Card className="mx-auto w-1/3 text-gray-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="m@example.com"/>
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Create password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Accept terms and conditions
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suscribe"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Suscribe newsletter
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={createAccount.isLoading}
              className="w-full"
            >
              {createAccount.isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="">
          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="w-full"
          >
            Sign up with Google <Icons.google className="m-2 h-4 w-4" />
          </Button> 
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
