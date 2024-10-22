import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { VGAux } from "@/components/vg-aux";

export default async function VGPage() {
  const session = await getServerAuthSession();

  const userPlates = await db.customPlate.findMany({
    where: { userId: session?.user.id },
    select: {
      plate: true,
    },
  });

  const lastFivePlates = await db.customPlate.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: 'desc' }, 
    take: 5,
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
      <VGAux
        plates={plates}
        currentPlate={vinPlate?.currentPlate}
        vin={vinPlate?.vin}
        services={num_services?.services}
        lastFivePlates={lastFivePlates.map((plate) => plate.plate)}
      />
    </main>
  );
}
