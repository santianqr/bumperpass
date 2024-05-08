import { api } from "@/trpc/server";
import { unstable_noStore as noStore } from "next/cache";

export async function TestingComponent() {
  noStore();
  const carData = await api.func.getCar.query();

  return <div>{carData?.currentPlate}</div>;
}
