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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const ideas = body.ideas;
    const num_ideas = body.num_ideas;
    const plateLength = body.plateLength;
    const plateType = body.plateType;
    const spaces = body.spaces;
    const symbols = body.symbols;
    const used_plates = body.used_plates;

    const user_input = `Ideas: ${ideas}

    Parameters:
    1. Plates lentgh: ${plateLength === "any" ? "each plate between 2 and 7 characters." : `each plate with exactly ${plateLength} characters.`}
    2. Plate type: ${plateType === "any" ? "use letters and numbers." : plateType === "letters" ? "use letters and no numbers." : "use just numbers excluding the 0 and no letters. "}
    3. Space: ${spaces}
    4. Emoji: ${symbols}
    `;
    console.log(user_input);

    const TEMPLATE = `Create ${num_ideas} custom plates following input parameters using input ideas. ${plateType === "numbers" ? "Give priority to numerical data to generate the plates." : ""}

      Each emoji or space count as a character.
      Emojis allowed: ❤, ⭐, 🖐, ➕.
      Replace ❤: ~, ⭐: *, 🖐: =, ➕: +.
      Just one space per plate.
      Just one emoji per plate.
      Number 0 are not allowed in the plates.
      Plates already in use: ${used_plates.join(", ")}

      Input: 
      {input}
      `;
    console.log(TEMPLATE);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.2,
      modelName: "gpt-4-0125-preview",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z.object({
      plate1: z
        .string()
        .describe(
          "First custom plate following the parameters being creative.",
        ),
      plate2: z
        .string()
        .describe(
          "Second custom plate following the parameters being creative.",
        ),
      plate3: z
        .string()
        .describe(
          "Third custom plate following the parameters being creative.",
        ),
      plate4: z
        .string()
        .describe(
          "Fourth custom plate following the parameters being creative.",
        ),
      plate5: z
        .string()
        .describe(
          "Fifth custom plate following the parameters being creative.",
        ),
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

    return NextResponse.json(result, { status: 200 });
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
