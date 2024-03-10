"use client";

import { Loader } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";

export default function DeleteForm() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const deleteAccount = api.func.deleteAccount.useMutation({
    onSuccess: async () => {
      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">Your account has been deleted.</code>
          </pre>
        ),
      });
      
      router.push("/");
      await signOut();
    },
  });

  function onClickDelete() {
    setShowConfirm(true);
  }

  function onClickCancel() {
    setShowConfirm(false);
  }

  function onClickYes() {
    const res = deleteAccount.mutate();
    console.log(res);
    setShowConfirm(false);
  }

  return (
    <div>
      <h4>Delete account</h4>
      <Button onClick={onClickDelete}>Delete</Button>
      {showConfirm && (
        <div>
          <p>Borrarás tu cuenta de bumperpass, estas seguro?</p>
          <Button onClick={onClickCancel} disabled={deleteAccount.isLoading}>
            Cancel
          </Button>
          <Button onClick={onClickYes} disabled={deleteAccount.isLoading}>
            {deleteAccount.isLoading ? <Loader /> : "Yes"}
          </Button>
        </div>
      )}
    </div>
  );
}
