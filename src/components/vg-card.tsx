"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plate } from "./plate";
import { useRouter } from "next/navigation";

type VGCardProps = {
  result: string[];
  description: string;
  attempt: number;
};

export function VGCard({ result, description, attempt }: VGCardProps) {
  const router = useRouter();

  return (
    <Card className="flex flex-col items-stretch">
      <CardHeader>
        <CardTitle>Your request</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardContent className="flex flex-wrap justify-center">
          {result.map((bp_plate, index) => (
            <div key={index} className="w-1/2 p-4">
              <Plate bpPlate={bp_plate} />
            </div>
          ))}
        </CardContent>
      </CardContent>
      {attempt === 2 && (
        <CardFooter className="self-end">
          <Link href="/account/dashboard">
            <Button
              type="submit"
              className="rounded-3xl bg-[#E62534] hover:bg-[#E62534]/90"
            >
              Go to my dashboard
            </Button>
          </Link>
          <Button
            className="rounded-3xl bg-[#E62534] hover:bg-[#E62534]/90"
            onClick={() => router.refresh()}
          >
            Go to my variation generator
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
