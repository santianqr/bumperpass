import { SearchForm } from "./search-form";
import { Card, CardContent } from "@/components/ui/card";
import { Plate } from "./plate";
import Link from "next/link";
import { api } from "@/trpc/server";
import { unstable_noStore as noStore } from "next/cache";

export async function SearchSection() {
  noStore();
  const carData = await api.func.getCar.query();
  return (
    <section
      className="from- flex flex-col items-center space-y-8 bg-cover bg-no-repeat p-4 text-white"
      style={{
        backgroundImage: "url('/services_bg.webp')",
      }}
    >
      <h2 className="col-span-2 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
        Search Now!
      </h2>
      <div className="grid grid-cols-1 items-center justify-items-center gap-4 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <Card className="flex items-center border-none bg-[#B1B1B1]/20 shadow-md md:max-w-md">
            <CardContent className="pt-6">
              <SearchForm
                currentPlate={carData?.currentPlate}
                vin={carData?.vin}
              />
            </CardContent>
          </Card>
        </div>
        <div className="order-1 md:order-2">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            How it works?
          </h3>
          <p className="mb-4 text-sm">Lets search for your license plate.</p>
          <ul className="mb-4 list-inside list-decimal space-y-2 text-sm">
            <li>
              <Link
                href="/login"
                className="font-semibold underline decoration-white"
              >
                Click here to login
              </Link>{" "}
              and start using our search service if you dont have an account{" "}
              <Link
                href="/register"
                className="font-semibold underline decoration-white"
              >
                sign up here.
              </Link>
            </li>
            <li>Choose the type of vehicle your have (auto or motorcycle).</li>
            <li>Next, select the state where your vehicle is registered.</li>
            <li>
              Now, the most exciting moment has arrived! In this field, you will
              enter exactly what you want to see reflected on your plate.
              Remember that you can combine letters, numbers, and the available
              symbols. Then, click on search to know if your desired plate is
              available.
            </li>
          </ul>
          <p className="mb-4 text-xs text-white/80">
            *Only certain specific types of plates allow including symbols
          </p>
          <Plate bpPlate="BMPRP4S" />

          <p className="text-center text-xs text-white/80">
            *This is not an official preview of your plate
          </p>
        </div>
      </div>
    </section>
  );
}
