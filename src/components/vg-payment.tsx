"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { PayButton } from "./pay-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function VGPayment() {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const saveServices = api.func.saveServices.useMutation();

  const handleCouponChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoupon(event.target.value);
  };

  const handleRedeem = async () => {
    if (coupon === "BP4EVER") {
      setErrorMessage("");
      await saveServices.mutateAsync();
      router.refresh();
      setSuccessMessage("Coupon redeemed successfully!");
    } else {
      setErrorMessage("Invalid coupon, try another one.");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="text-center text-sm">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
        reiciendis quis itaque quas aliquam, nihil quidem. Vel assumenda aut
        ipsa rem tempora quis, labore adipisci consequuntur dolorem odio
        distinctio quia?
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <PayButton />
        <Popover>
          <PopoverTrigger asChild>
            <Button>Redeem Coupon</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Input
              value={coupon}
              onChange={handleCouponChange}
              placeholder="Enter your coupon"
              className="w-full"
            />
            <Button onClick={handleRedeem} className="w-full">
              Redeem
            </Button>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-500">{successMessage}</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
