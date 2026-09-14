import { NextResponse } from "next/server";
import { analyzeClarification } from "@/features/ai/server/analyze-clarification";
import { experimentSchema, experimentFieldSchema } from "@/features/experiments/schemas/experiment.schema";
import { z } from "zod";

const requestSchema = z.object({
  experiment: experimentSchema,
  field: experimentFieldSchema,
  answer: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { experiment, field, answer } = parsed.data;

    const clarification = await analyzeClarification(experiment, field, answer);

    return NextResponse.json({ clarification });
  } catch (error) {
    console.error("[CLARIFY_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
