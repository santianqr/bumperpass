import { DashboardOptions } from "@/components/dashboard-options";

export default function Dashboard() {
  return (
    <main>
      <h3 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight text-gray-500">
        User Dashboard
      </h3>
      <section className="flex h-[60vh] items-center justify-center">
        <DashboardOptions />
      </section>
    </main>
  );
}
