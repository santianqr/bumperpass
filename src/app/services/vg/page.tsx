import { VGResults } from "@/components/vg-results";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { PayButton } from "@/components/pay-button";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CouponField } from "@/components/coupon-field";

export default async function VGPage() {
  const session = await getServerAuthSession();

  const userPlates = await db.customPlate.findMany({
    where: { userId: session?.user.id },
    select: {
      plate: true,
    },
  });

  const vinPlate = await db.user.findUnique({
    where: { id: session?.user.id },
    select: {
      vin: true,
      currentPlate: true,
    },
  });

  const num_services = await db.payment.findUnique({
    where: { userId: session?.user.id },
    select: {
      services: true,
    },
  });

  const plates = userPlates.map((plate) => plate.plate);
  console.log(num_services?.services);
  console.log(typeof userPlates);
  return (
    <main className="flex flex-col justify-center space-y-8">
      <section className="flex justify-center bg-gradient-to-r from-[#E62534] to-[#F59F0F] py-12 text-background">
        <div>
          <p className="text-3xl font-medium tracking-tighter sm:text-5xl">
            Welcome to our
          </p>
          <h2 className="text-4xl font-bold tracking-wide sm:text-6xl">
            Variation Generator
          </h2>
        </div>
      </section>
      <section className="flex justify-center">
        <div className="space-y-2">
        {num_services?.services === undefined && (
            <div>
              <PayButton /> 
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Redeem Coupon</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Do you have a coupon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      If you have a coupon, you can redeem it here.
                      <CouponField />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <p className="text-lg font-semibold text-primary">Instructions</p>
          <ul className="list-inside list-disc text-sm marker:text-foreground/60">
            <li>
              Be as specific as possible about your tastes and preferences. The
              more details you provide, the more personalized your suggestions
              will be.
            </li>
            <li>Separate each of your preferences by a full stop (.).</li>
            <li>
              Do not mention any preferences for spaces or symbols in your text,
              use the checkboxes below for that.
            </li>
            <li>Maximum of 180 characters.</li>
            <li>
              Inappropriate or offensive words/slangs and topics are not
              accepted in any language.
            </li>
          </ul>
          <p className="text-sm">
            <span className="font-medium">SPECIFIC EXAMPLE:</span> I love dogs
            and I have a beautiful labrador named Sally. I play videogames and I
            love Super Mario. I used to play soccer in high school and my
            favorite player is Messi. (168 characters)
          </p>
          <p className="text-sm">
            <span className="font-medium">NON-SPECIFIC EXAMPLE:</span> I love
            dogs, videogames, and soccer. (36 characters)
          </p>
        </div>
      </section>
      <VGResults
        plates={plates}
        currentPlate={vinPlate?.currentPlate}
        vin={vinPlate?.vin}
        services={num_services?.services}
      />
    </main>
  );
}
