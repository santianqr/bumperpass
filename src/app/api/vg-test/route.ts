import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Body = {
    plateLength: string;
    plateType: string;
    spaces: boolean;
    symbols: boolean;
    description: string;
    allPlates: string[];
    type: string;
  };
  
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    console.log("body: ", body);
    return NextResponse.json({ validPlates: ['HOLA', 'MUNDO', 'SOY', 'UNA', 'PRUEBA'], allPlates: ['HOLA', 'MUNDO', 'SOY', 'UNA', 'PRUEBA', 'NUEVA'] }, { status: 200 });
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
