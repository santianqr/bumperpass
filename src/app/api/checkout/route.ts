import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Stripe } from "stripe";
import { env } from "@/env";

type Body = {
  id: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: body.id,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/services/vg",
    cancel_url: "http://localhost:3000/",
  });

  return NextResponse.json({
    url: session.url,
  });
}
