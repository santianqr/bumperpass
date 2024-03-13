import { VGResults } from "@/components/vg-results";
import { api } from "@/trpc/server";

export default async function VGPage() {
  const userPlates = await api.func.getPlates.query();
  const plates = userPlates.map((plate) => plate.plate);
  console.log(plates);
  return (
    <main className="flex flex-col justify-center space-y-8">
      <section className="flex justify-center bg-gradient-to-r from-[#E62534] to-[#F59F0F] py-12 text-background">
        <div>
          <p className="text-5xl font-medium tracking-tighter">
            Welcome to our
          </p>
          <h2 className="text-6xl font-bold tracking-wide">
            Variation Generator
          </h2>
        </div>
      </section>
      <section className="flex justify-center">
        <div>
          <p className="text-lg font-semibold text-primary">Instructions</p>
          <ul className="list-inside list-disc text-sm marker:text-foreground/60">
            <li>
              Be specific as possible about your style, personality and
              interests to create a unique suggestions for your plate.
            </li>
            <li>Maximum XX characters.</li>
            <li>
              We have an estimated time of 1 to 2 minutes to have your results,
              depending on how specific you are.
            </li>
          </ul>
        </div>
      </section>
      <VGResults plates={plates} />
    </main>
  );
}
