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
    1. Number characters = ${plateLength === "any" ? "between 2 and 7 characters." : `exactly ${plateLength} characters.`}
    2. Type characters = ${plateType === "any" ? "Use letters and numbers." : plateType === "letters" ? "Use just letters. Numbers disabed." : ""}
    3. Space= ${spaces}
    4. Emoji= ${symbols}
    `;
    console.log(user_input);

    const TEMPLATE = `Create ${num_ideas} creative custom plates based on input ideas following the input parameters.

      Considerations:
      Number 0 are not allowed in the plates.
      The space " " counts as character.
      Emojis allowed: ❤, ⭐, 🖐, ➕.
      Replace ❤: ~, ⭐: *, 🖐: =, ➕: +.
      Just one space in middle of plate.
      Just one emoji per plate.
      ${used_plates.length > 0 ? `Plates already in use: ${used_plates.join(", ")}` : ""}
      
      Steps:
      1. Extract the input ideas.
      2. Analyze the input ideas.
      3. Add creativity and related data.
      4. Analyze and follow inputs parameters.
      5. Generate ${num_ideas} plates.

      Input: 
      {input}
      `;
    console.log(TEMPLATE);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.1,
      modelName: "gpt-4-0125-preview",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z.object({
      plates: z
        .array(
          z
            .string()
            .min(3)
            .max(7)
            .describe("Unique plate using input ideas and parameters."),
        )
        .length(num_ideas)
        .describe("Plates"),
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

    const result: { plates: string[] } = await chain.invoke({
      input: user_input,
    });

    const platesWithEmojis = result.plates.map((plate) =>
      replaceSymbolsWithEmojis(plate),
    );

    return NextResponse.json({ plates: platesWithEmojis }, { status: 200 });
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
