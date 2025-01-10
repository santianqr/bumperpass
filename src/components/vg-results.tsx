"use client";
import { useState, useEffect } from "react";
import { VGForm } from "@/components/vg-form";
import { VGCard } from "./vg-card";
import { VGPopup } from "./vg-popup";

type ResponseVg = {
  validPlates: string[];
  allPlates: string[];
};

type FormState = {
  plateLength: string;
  plateType: string;
  spaces: boolean;
  symbols: boolean;
  description: string;
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
  const [form, setForm] = useState<FormState | null>(null);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const storedResult = localStorage.getItem("vgResult");
    const storedForm = localStorage.getItem("vgForm");
    if (storedResult) setResult(JSON.parse(storedResult) as ResponseVg);
    if (storedForm) setForm(JSON.parse(storedForm) as FormState);
  }, []);

  // Guardar estado en localStorage
  useEffect(() => {
    if (result) localStorage.setItem("vgResult", JSON.stringify(result));
    if (form) localStorage.setItem("vgForm", JSON.stringify(form));
  }, [result, form]);

  return (
    <section className="flex justify-center">
      <div className="space-y-4">
        {/* Mostrar VGForm solo si resultAvailable es false */}
        {!result && !form && (
          <VGForm
            plates={plates}
            setResult={setResult}
            setForm={setForm}
            currentPlate={currentPlate}
            vin={vin}
            services={services}
            setResultAvailable={setResultAvailable}
          />
        )}
        {/* Mostrar VGCard y VGPopup si hay resultados */}
        {result && form && (
          <>
            <VGCard
              result={result.validPlates}
              description={form.description}
              attempt={1}
            />
            <VGPopup
              form={form}
              allPlates={result.allPlates}
              setResult={setResult}
              setForm={setForm}
            />
          </>
        )}
      </div>
    </section>
  );
}
