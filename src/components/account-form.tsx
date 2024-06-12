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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { AccountFormSchema } from "@/lib/formSchemas";

type Props = {
  name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  city: string | null;
  street: string | null;
  currentPlate: string | null;
  vin: string | null;
};

export function AccountForm({ accountData }: { accountData: Props }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof AccountFormSchema>>({
    resolver: zodResolver(AccountFormSchema),
    defaultValues: {
      name: accountData.name ?? "",
      email: accountData.email ?? "",
      city: accountData.city ?? "",
      street: accountData.street ?? "",
      currentPlate: accountData.currentPlate ?? "",
      state: accountData.state ?? "",
      phone: accountData.phone ?? "",
      vin: accountData.vin ?? "",
    },
  });

  const updateUser = api.func.updateAccount.useMutation();

  function onSubmit(data: z.infer<typeof AccountFormSchema>) {
    updateUser.mutate(data, {
      onSuccess() {
        toast({
          title: "Account updated!",
          description: "Your account has been successfully updated.",
        });
        router.refresh();
      },
      onError(error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-2 text-gray-500"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={accountData.name ?? ""}
                  disabled={accountData.name !== null}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  disabled
                  placeholder={accountData.email ?? ""}
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder={accountData.phone ?? ""} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ca">CA</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City*</FormLabel>
              <FormControl>
                <Input {...field} placeholder={accountData.city ?? ""} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address*</FormLabel>
              <FormControl>
                <Input {...field} placeholder={accountData.street ?? ""} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentPlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Plate*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={accountData.currentPlate ?? ""}
                  disabled={accountData.currentPlate !== null}
                />
              </FormControl>
              <FormDescription className="text-primary">
                {accountData.currentPlate === null
                  ? "Please, complete your Plate"
                  : ""}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>3 last digits of VIN*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={accountData.vin ?? ""}
                  disabled={accountData.vin !== null}
                />
              </FormControl>
              <FormDescription className="text-primary">
                {accountData.vin === null ? "Please, complete the VIN" : ""}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#E62534] hover:bg-[#E62534]/90"
          disabled={updateUser.isLoading}
        >
          {updateUser.isLoading ? <Loader className="animate-spin" /> : "Save"}
        </Button>
      </form>
    </Form>
  );
}
