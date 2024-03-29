import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRandomUserAgent } from "@/lib/userAgents";

type Body = {
  plates: string[];
  cookie: string;
};

type SymbolMap = {
  "❤": string;
  "⭐": string;
  "🖐": string;
  "➕": string;
};

const symbolMap: SymbolMap = {
  "❤": "heart",
  "⭐": "star",
  "🖐": "hand",
  "➕": "plus",
};

async function validPlate(
  plate: string,
  cookie: string,
): Promise<{ plate: string; isValid: boolean }> {
  const hasSymbol: boolean = /❤|⭐|🖐|➕/.test(plate);

  const symbolKey = Object.keys(symbolMap).find((symbol) =>
    new RegExp(symbol).test(plate),
  );
  const symbolName =
    symbolKey && symbolMap[symbolKey as keyof SymbolMap]
      ? symbolMap[symbolKey as keyof SymbolMap]
      : "";

  plate = plate.replace(/❤|⭐|🖐|➕/g, "@");
  plate = plate.replace(/ /g, "*").trim().padEnd(7, " ");

  const data = {
    kidsPlate: symbolName ?? "",
    plateType: hasSymbol ? "K" : "R",
    plateNameLow: hasSymbol ? "kids" : "environmental",
    plateChar0: !plate.startsWith(" ") ? plate[0] : "",
    plateChar1: plate[1] !== " " ? plate[1] : "",
    plateChar2: plate[2] !== " " ? plate[2] : "",
    plateChar3: plate[3] !== " " ? plate[3] : "",
    plateChar4: plate[4] !== " " ? plate[4] : "",
    plateChar5: plate[5] !== " " ? plate[5] : "",
    plateChar6: plate[6] !== " " ? plate[6] : "",
  };

  const stringData: Record<string, string> = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value ?? ""]),
  );

  const userAgent =
    getRandomUserAgent() ??
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

  const response = await fetch(
    "https://www.dmv.ca.gov/wasapp/ipp2/processConfigPlate.do",
    {
      method: "POST",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "User-Agent": userAgent,
        "Sec-Fetch-Site": "same-origin",
        Referer: "https://www.dmv.ca.gov/wasapp/ipp2/processPers.do",
        Origin: "https://www.dmv.ca.gov",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua-Platform": `"Windows"`,
        "Sec-Fetch-Dest": "document",
        "Sec-Ch-Ua": `"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"`,
        "Cache-Control": "max-age=0",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Cookie: cookie,
      },
      body: new URLSearchParams(stringData),
    },
  );

  if (response.ok) {
    const html = await response.text();
    const isValid = html.includes('aria-valuenow="30"');
    console.log(`Plate: ${plate}, isValid: ${isValid}`);
    return { plate, isValid };
  } else {
    console.log(`HTTP error! status: ${response.status}`);
    return { plate, isValid: false };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const plates = body.plates;
    const cookie = body.cookie;

    const validPlates: string[] = [];
    const limit = 5;

    for (const plate of plates) {
      if (validPlates.length >= limit) {
        break;
      }
      const result = await validPlate(plate, cookie);
      if (result.isValid) {
        validPlates.push(plate);
      }
      await delay(300);
    }

    return NextResponse.json({ validPlates });
  } catch (e: unknown) {
    if (e instanceof Error) {
      const error = e as { message?: string; status?: number };
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 500 },
      );
    }
  }
}
