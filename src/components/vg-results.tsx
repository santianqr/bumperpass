"use client";

import { VGForm } from "@/components/vg-form";
import { VGCard } from "./vg-card";
import { VGPopup } from "./vg-popup";
import { useState } from "react";

type ResponseVg = {
  validPlates: string[];
  allPlates: string[];
};

type VGResultsProps = {
  plates: string[];
  vin: string | null | undefined;
  currentPlate: string | null | undefined;
  services: number | null | undefined;
  setResultAvailable: (value: boolean) => void;
  };

export function VGResults({
  plates,
  vin,
  currentPlate,
  services,
  setResultAvailable,
}: VGResultsProps) {
  const [result, setResult] = useState<ResponseVg | null>(null);
  const [form, setForm] = useState<{
    plateLength: string;
    plateType: string;
    spaces: boolean;
    symbols: boolean;
    description: string;
    allPlates: string[];
  } | null>(null);

  return (
    <section className="flex justify-center">
      <div className="space-y-4">
        <VGForm
          plates={plates}
          setResult={setResult}
          setForm={setForm}
          currentPlate={currentPlate}
          vin={vin}
          services={services}
          setResultAvailable={setResultAvailable}
        />
        {result && form ? (
          <>
            <VGCard
              result={result.validPlates}
              description={form.description}
              attempt={1}
            />
            {form.allPlates}
            <VGPopup form={form} allPlates={result.allPlates} />
          </>
        ) : null}
      </div>
    </section>
  );
}
