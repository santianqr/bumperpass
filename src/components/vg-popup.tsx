"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { VGCard } from "./vg-card";
import { toast } from "@/components/ui/use-toast";

type VGPopupProps = {
  form: {
    plateLength: string;
    plateType: string;
    spaces: boolean;
    symbols: boolean;
    description: string;
    allPlates: string[];
  } | null;
  allPlates: string[];
  setResult: (value: ResponseVg | null) => void;
  setForm: (value: null) => void;
};

type ResponseVg = {
  validPlates: string[];
  allPlates: string[];
  message?: string;
};

export function VGPopup({ form, allPlates }: VGPopupProps) {
  const [showTextarea, setShowTextarea] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingYes, setLoadingYes] = useState(false);
  const [responseYes, setResponseYes] = useState<ResponseVg | null>(null);
  const [responseSend, setResponseSend] = useState<ResponseVg | null>(null);

  // Recuperar estados desde localStorage al cargar
  useEffect(() => {
    const storedResponseYes = localStorage.getItem("responseYes");
    const storedResponseSend = localStorage.getItem("responseSend");

    if (storedResponseYes) {
      setResponseYes(JSON.parse(storedResponseYes) as ResponseVg);
    }

    if (storedResponseSend) {
      setResponseSend(JSON.parse(storedResponseSend) as ResponseVg);
    }
  }, []);

  // Guardar estados en localStorage cuando cambian
  useEffect(() => {
    if (responseYes) {
      localStorage.setItem("responseYes", JSON.stringify(responseYes));
    }
    if (responseSend) {
      localStorage.setItem("responseSend", JSON.stringify(responseSend));
    }
  }, [responseYes, responseSend]);

  const handleYesClick = async () => {
    setLoadingYes(true);
    try {
      const response = await fetch("/api/vg-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateLength: form?.plateLength,
          plateType: form?.plateType,
          spaces: form?.spaces,
          symbols: form?.symbols,
          description: form?.description,
          allPlates: allPlates,
        }),
      });
      const responseData = (await response.json()) as ResponseVg;

      if (responseData.message) {
        toast({
          title: "Se alcanzó el máximo de iteraciones",
          description: responseData.message,
        });
      } else {
        setResponseYes(responseData);
        setShowTextarea(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Se produjo un error al procesar su solicitud.",
      });
    } finally {
      setLoadingYes(false);
    }
  };

  const handleNoClick = () => {
    setShowTextarea(true);
  };

  const handleSendClick = async () => {
    setLoadingSend(true);
    try {
      const response = await fetch("/api/vg-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateLength: form?.plateLength,
          plateType: form?.plateType,
          spaces: form?.spaces,
          symbols: form?.symbols,
          description: textareaValue,
          allPlates: allPlates,
        }),
      });
      const responseData = (await response.json()) as ResponseVg;

      if (responseData.message) {
        toast({
          title: "Se alcanzó el máximo de iteraciones. Intente de nuevo.",
          description: responseData.message,
        });
      } else {
        setResponseSend(responseData);
        setShowTextarea(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Se produjo un error al procesar su solicitud.",
      });
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <>
      {!responseYes && !responseSend && (
        <div className="flex flex-col items-center space-y-2 rounded-xl border bg-card p-6 text-card-foreground shadow">
          <p className="text-sm font-medium leading-none">
            ¿Le gustan las sugerencias actuales?
          </p>
          <div className="space-x-4">
            <Button
              onClick={handleYesClick}
              className="bg-[#E62534] hover:bg-[#E62534]/90"
              disabled={loadingYes || showTextarea}
            >
              {loadingYes ? <Loader className="animate-spin" /> : "Sí"}
            </Button>
            <Button
              onClick={handleNoClick}
              className="bg-[#F59F0F] hover:bg-[#F59F0F]/90"
              disabled={loadingYes || showTextarea}
            >
              No
            </Button>
          </div>
          {showTextarea && (
            <>
              <Textarea
                placeholder="Inserte una nueva descripción detallada de lo que le gustaría ver en su placa. ¡Cuanto más específicos sean los detalles y descripciones, más adaptadas serán las sugerencias!"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
              />
              <Button
                onClick={handleSendClick}
                className="bg-[#F59F0F] hover:bg-[#F59F0F]/90"
                disabled={loadingSend}
              >
                {loadingSend ? <Loader className="animate-spin" /> : "Enviar"}
              </Button>
            </>
          )}
        </div>
      )}

      {responseYes && form && (
        <VGCard
          result={responseYes.validPlates}
          description={form.description}
          attempt={2}
        />
      )}
      {responseSend && form && (
        <VGCard
          result={responseSend.validPlates}
          description={textareaValue}
          attempt={2}
        />
      )}
    </>
  );
}
