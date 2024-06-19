"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
//import { cn } from "@/lib/utils";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const FormSchema = z.object({
  plateLength: z.string({
    required_error: "Please select a valid option.",
  }),
  plateType: z.string({
    required_error: "Please select a valid option.",
  }),
  spaces: z.boolean().default(false),
  symbols: z.boolean().default(false),
  description: z
    .string()
    .min(20, {
      message: "Type at least 20 characters.",
    })
    .max(180, { message: "Type at most 180 characters." }),
  allPlates: z.array(z.string()),
  type: z
    .enum(["❤", "➕", "⭐", "🖐"], {
      required_error: "You need to select a notification type.",
    })
    .optional(),
});

type ResponseVg = {
  validPlates: string[];
  allPlates: string[];
  message?: string;
};

type VGFormProps = {
  setResult: (result: ResponseVg) => void;
  setForm: (data: {
    plateLength: string;
    plateType: string;
    spaces: boolean;
    symbols: boolean;
    type?: string;
    description: string;
    allPlates: string[];
  }) => void;
  plates: string[];
  currentPlate: string | null | undefined;
  vin: string | null | undefined;
};

export function VGForm({
  setResult,
  setForm,
  plates,
  currentPlate,
  vin,
}: VGFormProps) {
  const [loading, setLoading] = useState(false);
  //const [plateType, setPlateType] = useState("");
  console.log("from vg form", plates);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      spaces: false,
      symbols: false,
      allPlates: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    console.log(data);
    const allPlates = data.allPlates.concat(plates);
    console.log(allPlates);

    try {
      const response: Response = await fetch("/api/vg-main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, allPlates }),
      });
      const responseData = (await response.json()) as ResponseVg;

      if (responseData.message) {
        toast({
          title: "Maximum Iterations Reached. Please try again.",
          description: responseData.message,
        });
      } else {
        console.log(responseData.validPlates);
        setResult(responseData);
        setForm(data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your request.",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-1"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Insert your description" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plateLength"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                //disabled={plateType === "numbers"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the number of characters" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plateType"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  //setPlateType(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of characters" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">Letters and numbers</SelectItem>
                  <SelectItem value="letters">Letters</SelectItem>
                  <SelectItem value="numbers">Numbers</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-muted-foreground">
                At this time DMV most number only plates are not available.
                Please refrain from selecting only numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="spaces"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include spaces?</FormLabel>
                <FormDescription>
                  You can include spaces/half space on your generations.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbols"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include symbols?</FormLabel>
                <FormDescription>
                  You can include default DMV symbols allowed on your
                  generations.
                </FormDescription>
                <span className="text-xs text-muted-foreground">
                  *Only certian specific types of plates allow including symbols
                </span>
                {field.value && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex"
                          >
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="❤" />
                              </FormControl>
                              <FormLabel>❤</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="🖐" />
                              </FormControl>
                              <FormLabel>🖐</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="⭐" />
                              </FormControl>
                              <FormLabel>⭐</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="➕" />
                              </FormControl>
                              <FormLabel>➕</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-[#E62534] hover:bg-[#E62534]/90"
          disabled={loading || !vin || !currentPlate}
        >
          {loading ? <Loader className="animate-spin" /> : "Generate"}
        </Button>
        {(!vin || !currentPlate) && (
          <p className="text-xs text-primary">
            You must complete the last 3 digits of the VIN and the plate before
            using the Variation Generator.
          </p>
        )}
      </form>
    </Form>
  );
}
