"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Icons } from "./icons";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { LoginFormSchema } from "@/lib/formSchemas";
import type { z } from "zod";

export function LoginForm() {
  const [loading, setLoading] = useState(false);


  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    setLoading(true);
    const loginData = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/",
    });
    //console.log(loginData);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(loginData, null, 2)}
          </code>
        </pre>
      ),
    });
    setLoading(false);
  }

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/"});
    setLoading(false);
  };

  return (
    <main>
      <Card className="mx-auto max-w-xs md:max-w-md text-gray-500">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email below to sign in into your account
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
                      <Input {...field} placeholder="m@example.com" type="email" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
              <Loader className="animate-spin" />
            ) : (
              
                "Sign In with Credentials"
              
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
              onClick={handleSignIn}
              className="w-full mb-2"
              disabled={loading}
            >
              {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                Sign In with Google <Icons.google className="m-2 h-4 w-4" />
              </>
            )}
            </Button>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground"
          >
            <p>Forgot your password?</p>
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            If you dont have an account{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
