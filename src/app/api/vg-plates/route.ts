import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
//import { env } from "@/env";

type Body = {
  ideas: string;
  num_ideas: number;
  plateLength: string;
  plateType: string;
  spaces: boolean;
  symbols: boolean;
  used_plates: string[];
};

const emojiMap: Record<string, string> = {
  "~": "❤",
  "*": "⭐",
  "=": "🖐",
  "+": "➕",
};

// Función que reemplaza los símbolos por emojis
function replaceSymbolsWithEmojis(str: string): string {
  return str.replace(/[\~\*\=\+]/g, (symbol) => emojiMap[symbol] ?? symbol);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const ideas = body.ideas;
    const num_ideas = body.num_ideas * 2;
    const plateLength = body.plateLength;
    const plateType = body.plateType;
    const spaces = body.spaces;
    const symbols = body.symbols;
    const used_plates = body.used_plates;

    const user_input = `Ideas: ${ideas}

    Parameters:
    1. Plates lentgh = ${plateLength === "any" ? "between 2 and 7 characters." : `exactly ${plateLength} characters.`}
    2. Plate type = ${plateType === "any" ? "Use letters and numbers." : plateType === "letters" ? "Use just letters. Numbers disabed." : ""}
    3. Space= ${spaces}
    4. Emoji= ${symbols}
    `;
    console.log(user_input);

    const TEMPLATE = `Create ${num_ideas} creative custom plates based on input ideas following input parameters.

      Considerations:
      Number 0 are not allowed in the plates.
      The space " " counts as character.
      Emojis allowed: ❤, ⭐, 🖐, ➕.
      Replace ❤: ~, ⭐: *, 🖐: =, ➕: +.
      Just one space in middle of plate.
      Just one emoji per plate.
      Plates already in use: ${used_plates.join(", ")}
      Generate ${num_ideas} plates.
      
      Steps:
      1. Extract the input ideas.
      2. Analyze the input ideas.
      3. Add creativity and related data.
      4. Ensure each plate fill the input parameters and considerations.
      5. Generate ${num_ideas} plates.

      Input: 
      {input}
      `;
    //console.log(TEMPLATE);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.1,
      modelName: "gpt-4-0125-preview",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z.object({
      plate1: z.string().describe("First custom plate."),
      plate2: z.string().describe("Second custom plate."),
      plate3: z.string().describe("Third custom plate."),
      plate4: z.string().describe("Fourth custom plate."),
      plate5: z.string().describe("Fifth custom plate."),
      plate7: z.string().describe("Sixth custom plate."),
      plate8: z.string().describe("Seventh custom plate."),
      plate9: z.string().describe("Nineth custom plate."),
      plate10: z.string().describe("Tenth custom plate."),
    });

    const functionCallingModel = model.bind({
      functions: [
        {
          name: "output_formatter",
          description: "Should always be used to properly format output",
          parameters: zodToJsonSchema(schema),
        },
      ],
      function_call: { name: "output_formatter" },
    });

    const chain = prompt
      .pipe(functionCallingModel)
      .pipe(new JsonOutputFunctionsParser());

    const result = await chain.invoke({
      input: user_input,
    });

    const newArray: string[] = Object.values(result);
    const resultArray = newArray.map(replaceSymbolsWithEmojis);
    const plates = {
      plates: resultArray,
    };

    return NextResponse.json(plates, { status: 200 });
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
