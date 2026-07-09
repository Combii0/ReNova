import { NextRequest, NextResponse } from "next/server";

const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";

type HelpyRequest = {
  message?: string;
  previousInteractionId?: string | null;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMMA_API_KEY ?? process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMMA_API_KEY or GEMINI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as HelpyRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
      input: message,
      previous_interaction_id: body.previousInteractionId ?? undefined,
      system_instruction:
        "Eres Helpy, el asistente de ReNova. Responde en espanol claro y breve. Ayudas a comprar segun presupuesto, tiempo, calidad y necesidad. Tambien guias a vendedores para publicar productos con buen precio, descripcion y categoria. No inventes disponibilidad real; si falta informacion, pide datos concretos.",
      generation_config: {
        temperature: 0.7,
        thinking_level: "low",
      },
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message ??
          "Helpy could not generate a response. Try again.",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    id: data?.id ?? null,
    text:
      data?.output_text ??
      data?.steps?.flatMap((step: { content?: { text?: string }[] }) =>
        step.content?.map((item) => item.text).filter(Boolean) ?? [],
      )?.join("\n") ??
      "No pude generar una respuesta.",
  });
}

