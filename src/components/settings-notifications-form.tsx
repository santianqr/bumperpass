"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  //  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";

const FormSchema = z.object({
  suscribe: z.boolean(),
});

type Props = {
  suscribe: boolean;
};

export function NotificactionsForm({ suscribe }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      suscribe: suscribe,
    },
  });

  const updateSuscribe = api.func.updateSuscribe.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    updateSuscribe.mutate(data, {
      onError(error) {
        toast({
          title: "Something went wrong",
          description: error.message,
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Notifications
          </h4>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="suscribe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm">
                  <div className="space-y-0.5">
                    <FormDescription>
                      Receive newsletters, promotions and news from Bumperpass
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        onSubmit({ suscribe: value });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Bumperpass will process your data to send information about our
              products, services, promotions, surveys and giveaways based on our
              legitimate interest, as well as news about artist you follow if
              you have given your consent to do so. Your data will not be
              communicated to third parties.
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}
