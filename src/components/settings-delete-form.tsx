"use client";

import { z } from "zod";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";

export default function DeleteForm() {

  const deleteAccount = api.func.deleteAccount.useMutation({
    onSuccess: () => {
      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">Your account has been deleted.</code>
          </pre>
        ),
      });
    },
  });

  function onClick() {
    const res = deleteAccount.mutate();
    console.log(res);
  }


  return <div><h4>Delete account</h4></div>;
}
