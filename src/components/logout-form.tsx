"use client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader } from "lucide-react";

export function LogoutForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleCancel = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };
  return (
    <main>
      <Card className="mx-auto flex max-w-xs flex-col items-center">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Logout</CardTitle>
          <CardDescription>Are you sure you want to log out?</CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-[#E62534] hover:bg-[#E62534]/90"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F59F0F] hover:bg-[#F59F0F]/90"
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>Yes, sign out</>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
