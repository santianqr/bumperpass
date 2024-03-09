import { ServicesCard } from "./services-card";

type Props = {
  id: string;
};

export function ServicesSection({ id }: Props) {
  return (
    <section id={id} className="space-y-4 border-t-2 border-[#E62534]">
      <div className="mx-auto w-40 rounded-b-lg bg-[#E62534] p-2">
        <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight text-background first:mt-0">
          Services
        </h2>
      </div>
      <ServicesCard />
    </section>
  );
}
