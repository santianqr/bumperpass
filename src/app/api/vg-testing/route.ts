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
  type: string;
  used_plates: string[];
};

const emojiMap: Record<string, string> = {
  "~": "❤",
  "*": "⭐",
  "=": "🖐",
  "+": "➕",
};

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
    const type = body.type;
    const used_plates = body.used_plates;

    const user_input = `
    Preferences: ${ideas}
    Parameters:
    - Number characters = ${plateLength === "any" ? "between 2 and 7 characters." : `exactly ${plateLength} characters.`}
    - Letters = ${plateType === "any" || plateType === "letters" ? "enabled" : "disabled"}
    - Numbers = ${plateType === "any" || plateType === "numbers" ? "enabled" : "disabled"}
    - Space = ${spaces ? "enabled" : "disabled"}
    - Emoji = ${symbols ? "enabled" : "disabled"}
    ${symbols ? `- Emoji type = ${type}` : ""}
    `;
    console.log(user_input);

    const TEMPLATE = `
    Consider:
    ${plateType === "any" || plateType === "numbers" ? "Number 0 not allowed." : ""}
    ${spaces ? 'Space " " counts as character.' : ""}
    ${spaces ? "Max one space within the text but not at the edges." : ""}
    ${symbols ? "Emoji counts as character." : ""}
    ${symbols ? "Emojis allowed: ❤, ⭐, 🖐, ➕." : ""}
    ${symbols ? "Replace ❤: ~, ⭐: *, 🖐: =, ➕: +." : ""}
    ${symbols ? "Max one emoji per plate." : ""}
    ${used_plates.length > 0 ? `Plates already in use: ${used_plates.join(", ")}` : ""}

    Steps:
    1. Build a plate based on input preferences.
    2. Apply input parameters.
    3. Add creativity.
    4. Generate ${num_ideas} plates based on input preferences.

    Input: 
    {input}
    `;
    console.log(TEMPLATE);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.5,
      modelName: "gpt-4o",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z.object({
      plates: z
        .array(
          z
            .string()
            .min(3)
            .max(7)
            .describe("Plate based on input preferences and parameters."),
        )
        .length(num_ideas)
        .describe("Plates based on input preferences and parameters."),
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
