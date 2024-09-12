"use client";
import { useState } from "react";
import { VGResults } from "@/components/vg-results";
import { VGPayment } from "@/components/vg-payment";

type VGResultsProps = {
  plates: string[];
  vin: string | null | undefined;
  currentPlate: string | null | undefined;
  services: number | null | undefined;
};

export function VGAux({ plates, vin, currentPlate, services }: VGResultsProps) {
  const [resultAvailable, setResultAvailable] = useState(false);
  const [showOnlyPayment, setShowOnlyPayment] = useState(false);

  return (
    <>
      {showOnlyPayment && <VGPayment />}
      {!resultAvailable && (
        <section className="flex justify-center">
          <div className="space-y-2">
            <VGPayment />
            <p className="text-lg font-semibold text-primary">Instructions</p>
            <ul className="list-inside list-disc text-sm marker:text-foreground/60">
              <li>
                Be as specific as possible about your tastes and preferences.
                The more details you provide, the more personalized your
                suggestions will be.
              </li>
              <li>Separate each of your preferences by a full stop (.).</li>
              <li>
                Do not mention any preferences for spaces or symbols in your
                text, use the checkboxes below for that.
              </li>
              <li>Maximum of 180 characters.</li>
              <li>
                Inappropriate or offensive words/slangs and topics are not
                accepted in any language.
              </li>
            </ul>
            <p className="text-sm">
              <span className="font-medium">SPECIFIC EXAMPLE:</span> I love dogs
              and I have a beautiful labrador named Sally. I play videogames and
              I love Super Mario. I used to play soccer in high school and my
              favorite player is Messi. (168 characters)
            </p>
            <p className="text-sm">
              <span className="font-medium">NON-SPECIFIC EXAMPLE:</span> I love
              dogs, videogames, and soccer. (36 characters)
            </p>
          </div>
        </section>
      )}
      <VGResults
        plates={plates}
        currentPlate={currentPlate}
        vin={vin}
        services={services}
        setResultAvailable={setResultAvailable}
        setShowOnlyPayment={setShowOnlyPayment}
      />
    </>
  );
}
