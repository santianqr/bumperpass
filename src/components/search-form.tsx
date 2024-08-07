"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { HandIcon, HeartIcon, StarIcon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
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
//import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { SearchAvailable } from "@/components/search-available";
import { SearchNotAvailable } from "@/components/search-not-available";
import { SearchFormSchema } from "@/lib/formSchemas";

type ResponseData = {
  message: string;
  status: number;
};

type SearchProps = {
  currentPlate: string | null | undefined;
  vin: string | null | undefined;
};

export function SearchForm({ currentPlate, vin }: SearchProps) {
  const [searchResponse, setSearchResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof SearchFormSchema>) {
    setIsLoading(true);

    const res = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resSearch = (await res.json()) as ResponseData;
    setSearchResponse(resSearch.message);
    {
      /* 
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  */
    }
    setIsLoading(false);
  }

  const form = useForm<z.infer<typeof SearchFormSchema>>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      personalizedPlate: "",
      state: "CA",
      vehicleType: "AUTO",
    },
  });

  function onClear() {
    form.reset({
      personalizedPlate: "",
      state: "",
      vehicleType: "",
    });
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 text-white"
      >
        <FormField
          control={form.control}
          name="vehicleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What kind of vehicle do you have?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="MOTO">Motorcycle</SelectItem>
                </SelectContent>
              </Select>
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
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CA">CA</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalizedPlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is the plate of your dreams?</FormLabel>

              <FormControl>
                <Input
                  placeholder="Please type your plate"
                  {...field}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    field.onChange(e);
                  }}
                  className="placeholder:text-white/50"
                />
              </FormControl>

              <FormDescription className="flex items-center space-x-2 text-white">
                <span>Insert symbol</span>
                <HandIcon
                  onClick={() => field.onChange(field.value + "🖐")}
                  className="cursor-pointer"
                />
                <HeartIcon
                  onClick={() => field.onChange(field.value + "❤")}
                  className="cursor-pointer"
                />
                <StarIcon
                  onClick={() => field.onChange(field.value + "⭐")}
                  className="cursor-pointer"
                />
                <PlusIcon
                  onClick={() => field.onChange(field.value + "➕")}
                  className="cursor-pointer"
                />
              </FormDescription>
              <FormDescription>
                <span className={cn("text-[0.8rem] text-white")}>
                  *Only certian specific types of plates allow including symbols
                </span>
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-8 md:space-y-0">
          <Button type="submit" disabled={isLoading || !vin || !currentPlate}>
            {isLoading ? <Loader className="animate-spin" /> : "Search"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-foreground"
            onClick={onClear}
            disabled={isLoading || !vin || !currentPlate}
          >
            Clear
          </Button>
          {(!vin || !currentPlate) && (
            <p className="text-xs mt-2 md:mt-0">
              You must to complete 3 last digits of VIN and the plate before to
              use the Search.
            </p>
          )}
        </div>
      </form>
      {searchResponse && (
        <div>
          {searchResponse === "OK" ? (
            <SearchAvailable />
          ) : (
            <SearchNotAvailable />
          )}
        </div>
      )}
    </Form>
  );
}
