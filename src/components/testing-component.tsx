import { api } from "@/trpc/server";

export async function TestingComponent() {
  const carData = await api.func.getCar.query();

  return <div>{carData?.currentPlate}</div>;
}
