import { Stripe } from "stripe";
import { env } from "@/env";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "./ui/card";
import { PayButton } from "./pay-button";

export async function TestingComponent() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const prices = await stripe.prices.list();

  const product = prices.data[0];
  console.log(product?.id);
  const nickname = product?.nickname;
  const unitAmount = product?.unit_amount
    ? (product.unit_amount / 100).toFixed(2)
    : "N/A";
  const description =
    "Unlock 10 unique California license plates with a one-time payment! Provide your input, and we'll create personalized designs reflecting your style. Perfect for car enthusiasts, collectors, or unique gifts. Stand out with exclusive, custom plates!";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{nickname}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <h3 className="text-2xl font-bold">${unitAmount}</h3>
        <PayButton id={product?.id ?? ""} />
      </CardContent>
    </Card>
  );
}
