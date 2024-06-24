import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRandomUserAgent } from "@/lib/userAgents";
import { api } from "@/trpc/server";

const userAgent =
  getRandomUserAgent() ??
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type Body = {
  plateLength: string;
  plateType: string;
  spaces: boolean;
  symbols: boolean;
  description: string;
  allPlates: string[];
  type: string;
};

type ResponseCookie = {
  message: string;
};

//type ResponseIdeas = {
//  ideas: string[];
//};

type ResponsePlates = {
  plates: string[];
};

type ResponseValid = {
  validPlates: string[];
};

type ResponseSearch = {
  validPlates: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const plateLength = body.plateLength;
    const plateType = body.plateType;
    const spaces = body.spaces;
    const symbols = body.symbols;
    const description = body.description;
    const type = body.type;
    let allPlates: string[] = body.allPlates;
    console.log("allPlates: in vg main", allPlates);
    // get the cookie
    const response_cookie: Response = await fetch(
      "http://localhost:3000/api/vg-cookie",
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "User-Agent": userAgent,
        },
      },
    );
    const data_cookies = (await response_cookie.json()) as ResponseCookie;
    const cookies = data_cookies.message;
    console.log("cookies: ", cookies);

    let validPlates: string[] = [];
    let iterationsCount = 0;

    console.log("validPlates.length: ", validPlates.length);
    while (validPlates.length < 5 && iterationsCount < 10) {
      iterationsCount++;
      const num_ideas = 5 - validPlates.length;

      console.log("all plates", allPlates);
      // get the plates
      const response_plates: Response = await fetch(
        "http://localhost:3000/api/vg-testing",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
          },
          body: JSON.stringify({
            ideas: description,
            num_ideas: num_ideas,
            plateLength: plateLength,
            plateType: plateType,
            spaces: spaces,
            symbols: symbols,
            used_plates: allPlates,
            type: type,
          }),
        },
      );
      const data_plates = (await response_plates.json()) as ResponsePlates;
      const plates = data_plates.plates;
      console.log("plates:", plates);

      // validate each plate by algorithm
      const response_valid: Response = await fetch(
        "http://localhost:3000/api/vg-valid",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
          },
          body: JSON.stringify({
            plateLength: plateLength,
            plateType: plateType,
            spaces: spaces,
            symbols: symbols,
            plates: plates,
            allPlates: allPlates,
          }),
        },
      );
      const data_valid = (await response_valid.json()) as ResponseValid;
      const valid_plates = data_valid.validPlates;
      console.log("valid plates: ", valid_plates);

      allPlates = allPlates.concat(plates);
      console.log("allPlates:", allPlates);
      // second validation with search vg
      const response_search: Response = await fetch(
        "http://localhost:3000/api/vg-search",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
          },
          body: JSON.stringify({
            plates: valid_plates,
            cookie: cookies,
          }),
        },
      );
      const data_search = (await response_search.json()) as ResponseSearch;
      const search_plates = data_search.validPlates;
      console.log("search plates: ", search_plates);
      validPlates = validPlates.concat(search_plates);
    }
    // Check if max iterations were reached without finding enough valid plates
    if (iterationsCount >= 10 && validPlates.length < 5) {
      return NextResponse.json({
        message:
          "Reached maximum iterations without finding enough valid plates. Please try again.",
        validPlates,
        allPlates,
      });
    }

    await api.func.saveValidPlates.mutate({ plates: validPlates, description });

    return NextResponse.json({
      validPlates,
      allPlates,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      body: "An error occurred while processing the request.",
    });
  }
}
