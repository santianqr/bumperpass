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

    const user_input = `Preferences: ${ideas}

    Parameters:
    1. Number characters = ${plateLength === "any" ? "between 2 and 7 characters." : `exactly ${plateLength} characters.`}
    2. Type characters = ${plateType === "any" ? "use letters and numbers." : plateType === "letters" ? "use letters. Numbers disabled." : "use numbers. Letters disabled."}
    3. Space = ${spaces ? "enabled" : "disabled"}
    4. Emoji = ${symbols ? "enabled" : "disabled"}
    ${symbols ? `5. Emoji type = ${type}` : ""}
`;
    console.log(user_input);

    const TEMPLATE = `Create ${num_ideas} creative custom plates based on input preferences following the input parameters. ${plateType === "any" || plateType === "numbers" ? "Include statistics, measurements, quantities, rankings, dates and any other numerical information that could be relevant and interesting for the plates." : ""}

    Consider if is the case:
    Number 0 are not allowed in the plates.
    The space " " counts as character.
    Emojis allowed: ❤, ⭐, 🖐, ➕.
    Replace ❤: ~, ⭐: *, 🖐: =, ➕: +.
    Just one space in middle of plate.
    Just one emoji per plate.
    ${used_plates.length > 0 ? `Plates already in use: ${used_plates.join(", ")}` : ""}

    Steps:
    1. Analyze input preferences for links, keywords, and specific details.
    2. Analyze other information into the main topic for the ideas.
    3. Analyze and follow input parameters.
    4. Use input preferences to create unique, relevant, and personalized plates.
    5. Generate ${num_ideas} plates.

    Input: 
    {input}
    `;
    console.log(TEMPLATE);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.8,
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
