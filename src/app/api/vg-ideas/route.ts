import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
//import { env } from "@/env";

type Body = {
  description: string;
  num_ideas: number;
  plateType: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const user_input = body.description;
    const num_ideas = body.num_ideas;
    const plateType = body.plateType;

    const TEMPLATE = `Generate ${num_ideas} ideas (max 80 chars each) from user input. Mention and link interesting/specific facts about the topics. ${plateType === "numbers" ? "Focus on all numeric data available. This includes statistics, measurements, quantities, rankings, dates and any other numerical information that could be relevant and interesting." : ""}. Split ideas by ".".

    Steps:
    1. Analyze input for links, keywords, and specific details.
    2. Analyze ideas that integrate topics and specific details.
    3. Analyze other information into the main topic for the ideas.
    3. Generate a text with ${num_ideas} ideas following the steps.
    
    Input:{input}`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    console.log(TEMPLATE);
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-4-0125-preview",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z.object({
      ideas: z
        .string()
        .max(400)
        .describe(
          `Unique and creative short text based on user's input, linking topics, ideas, and related data with curious facts.`,
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
