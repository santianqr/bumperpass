"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";

export function CouponField() {
  const [coupon, setCoupon] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const saveServices = api.func.saveServices.useMutation();

  const handleCouponChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoupon(event.target.value);
  };

  function handleRedeem() {
    if (coupon === "BP4EVER") {
      setIsCouponApplied(true);
      setErrorMessage("");
      saveServices.mutate();
    } else {
      setIsCouponApplied(false);
      setErrorMessage("Invalid coupon, try another.");
    }
  }

  return (
    <>
      <Input
        placeholder="Type your coupon"
        value={coupon}
        onChange={handleCouponChange}
      />

      <Button onClick={handleRedeem}>Redeem Coupon</Button>
      {isCouponApplied && (
        <p className="text-sm">
          Coupon applied successfully! Try on: <a href="/services/vg" />
        </p>
      )}
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </>
  );
}
