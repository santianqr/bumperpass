"use client";

import { Button } from "./ui/button";

type CheckoutResponse = {
  url: string;
};


export async function PayButton() {
  async function onSubmit() {
    const res: Response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 'price_1PV2lJ03f3Kk4V9MKjOMT1Li' }),
    });
    const response = (await res.json()) as CheckoutResponse;
    window.location.href = response.url;
  }
  return (
    <Button onClick={onSubmit} className="bg-[#F59F0F] hover:bg-[#F59F0F]/90">
      Purchase NOW!
    </Button>
  );
}
