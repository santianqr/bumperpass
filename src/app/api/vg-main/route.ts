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

    // Obtener la cookie
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
      // Obtener las placas
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

      // Validar cada placa mediante algoritmo
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
      // Segunda validación con búsqueda vg
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

    // Verificar si hay al menos una placa válida
    if (validPlates.length > 0) {
      // Determinar si el proceso se completó correctamente
      const completed = validPlates.length >= 5;

      // Guardar las placas y su estado de finalización
      await api.func.saveValidPlates.mutate({
        plates: validPlates,
        description,
        completed,
      });

      // Responder dependiendo del estado de completitud
      if (!completed) {
        return NextResponse.json({
          message:
            "Incomplete process, but the available plates have been saved.",
          validPlates,
          allPlates,
        });
      } else {
        await api.func.deleteServices.mutate();
      }

      return NextResponse.json({
        validPlates,
        allPlates,
      });
    }

    // Si no hay placas válidas, enviar solo el mensaje de error
    return NextResponse.json({
      message:
        "Maximum iterations reached without finding valid plates. Please try again.",
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      body: "An error occurred while processing the request.",
    });
  }
}
