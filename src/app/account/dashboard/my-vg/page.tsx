import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/trpc/server";
import { Plate } from "@/components/plate";

type PlateData = {
  createdAt: Date;
  description: string;
  plate: string;
  completed: boolean;
};
import { unstable_noStore as noStore } from "next/cache";

export default async function MyVG() {
  noStore();
  const vgData: PlateData[] = await api.func.getVG.query();

  if (!vgData) {
    return <div className="text-center">No data available</div>;
  }

  const groupedData = vgData.reduce<Record<string, PlateData[]>>(
    (acc, plate) => {
      if (plate.createdAt && plate.description) {
        // Determine if any plate is not completed
        const completionStatus = plate.completed ? "" : " - Not Completed";
        const key = `${plate.createdAt.toLocaleDateString()} - ${plate.description}${completionStatus}`;
        
        // Utilizando coalescencia nula para asegurar que acc[key] siempre sea un array
        (acc[key] ??= []).push(plate);
      }
      return acc;
    },
    {},
  );
  
  return (
    <main>
      <Accordion type="single" collapsible>
        {Object.entries(groupedData).map(([key, plates], index) => (
          <AccordionItem key={`item-${index}`} value={`item-${index}`}>
            <AccordionTrigger>{key}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap">
                {" "}
                {/* Aquí agregamos Flexbox */}
                {plates.map((plate) => (
                  <Plate key={plate.plate} bpPlate={plate.plate} /> // Aquí usamos el componente Plate
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
