"use client";

import { Button } from "./ui/button";

type CheckoutResponse = {
  url: string;
};

type PayButtonProps = {
  id: string;
};

export async function PayButton({ id }: PayButtonProps) {
  async function onSubmit() {
    const res: Response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    const response = (await res.json()) as CheckoutResponse;
    window.location.href = response.url;
  }
  return (
    <Button size="lg" onClick={onSubmit}>
      Buy
    </Button>
  );
}
