import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SearchNotAvailable() {
  return (
    <div className="mt-2 flex flex-col items-center space-y-2 text-center text-sm text-white">
      <p className="text-xl font-semibold">Sorry!</p>
      <p>It seems this plate is already taken</p>

      <p>
        Try searching for another option, or explore other creative options with
        the help of our{" "}
        <Link href="/services/vg" className="font-medium ">
          Variation Generator
        </Link>
      </p>
      <p className="font-medium">
        Click below to get our tailored creative alternatives.
      </p>
      <Link href="/services/vg">
        <Button>Go!</Button>
      </Link>
      
    </div>
  );
}
