import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { Stripe } from "stripe";
import { env } from "@/env";
import { api } from "@/trpc/server";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const endpointSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const error = e as { message?: string; status?: number };
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 500 },
      );
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const email = session.customer_details?.email;
      //console.log(session.customer_details?.email);
      if (email) {
        await api.func.saveServicesStripe.mutate({
          email,
        });
      } else {
        return NextResponse.json(
          { error: "Email is missing from the session" },
          { status: 400 },
        );
      }

      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  //console.log(body);

  return NextResponse.json({
    message: "success",
    status: 200,
  });
}
