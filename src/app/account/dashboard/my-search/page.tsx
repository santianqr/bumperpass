import { api } from "@/trpc/server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlateData = {
  plate: string;
  available: boolean;
  vehicleType: string;
  state: string;
  createdAt: Date;
};

export default async function MySearch() {
  const searchData: PlateData[] = await api.func.getSearch.query();

  return (
    <main>
      <Table>
        <TableCaption>List of your plates from Search</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Plate</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchData.map((plate) => (
            <TableRow key={plate.plate}>
              <TableCell>{plate.plate}</TableCell>
              <TableCell>{plate.available ? "Yes" : "No"}</TableCell>
              <TableCell>{plate.vehicleType}</TableCell>
              <TableCell>{plate.state}</TableCell>
              <TableCell>{plate.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
