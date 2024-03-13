import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/trpc/server";

type PlateData = {
  createdAt: Date;
  description: string;
  plate: string;
};

export default async function MyVG() {
  const vgData: PlateData[] = await api.func.getVG.query();

  if (!vgData) {
    return <div>No data available</div>;
  }

  const groupedData = vgData.reduce<Record<string, PlateData[]>>(
    (acc, plate) => {
      if (plate.createdAt && plate.description) {
        const key = `${plate.createdAt.toLocaleDateString()} - ${plate.description}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key]!.push(plate);
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
              <ul>
                {plates.map((plate) => (
                  <li key={plate.plate}>{plate.plate}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
