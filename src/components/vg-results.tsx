"use client";

import { useEffect } from 'react';
import { VGForm } from "@/components/vg-form";
import { VGCard } from "./vg-card";
import { VGPopup } from "./vg-popup";
import { useState } from "react";

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

  // Cargar estado desde localStorage cuando el componente se monta
  useEffect(() => {
    const storedResult = localStorage.getItem('result');
    const storedForm = localStorage.getItem('form');
    if (storedResult) {
      const parsedResult = JSON.parse(storedResult) as ResponseVg; // Asignación de tipo explícita
      setResult(parsedResult);
    }
    if (storedForm) {
      const parsedForm = JSON.parse(storedForm) as FormState; // Asignación de tipo explícita
      setForm(parsedForm);
    }
  }, []);

  // Guardar estado en localStorage cuando result o form cambian
  useEffect(() => {
    if (result) localStorage.setItem('result', JSON.stringify(result));
    if (form) localStorage.setItem('form', JSON.stringify(form));
  }, [result, form]);

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
            <VGPopup form={form} allPlates={result.allPlates} setResult={setResult} setForm={setForm} />
          </>
        ) : null}
      </div>
    </section>
  );
}
