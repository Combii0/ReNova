import { NextRequest, NextResponse } from "next/server";

const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";

type HelpyRequest = {
  message?: string;
  previousInteractionId?: string | null;
};

type GeminiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

function helpyErrorMessage(status: number, code?: string) {
  if (status === 401 || code === "authentication") {
    return "Helpy no está configurado correctamente. Revisa la clave de Gemini.";
  }

  if (status === 403 || code === "permission_denied") {
    return "Helpy no está disponible porque la clave o el proyecto de Gemini no tienen acceso. Crea una clave nueva en Google AI Studio y actualízala en Vercel.";
  }

  if (status === 404 || code === "not_found" || code === "model_not_found") {
    return "La conversación anterior ya no está disponible. Reinicia el chat e inténtalo de nuevo.";
  }

  if (status === 429) {
    return "Helpy está recibiendo muchas solicitudes. Espera un momento e inténtalo de nuevo.";
  }

  return "Helpy no pudo responder en este momento. Inténtalo de nuevo.";
}

export async function POST(request: NextRequest) {
  // GEMINI_API_KEY is the current name. GEMMA_API_KEY remains as a temporary
  // fallback so existing local setups keep working while the Vercel variable is updated.
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GEMMA_API_KEY;

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
        "Eres Helpy, el asistente de ReNova. Responde en espanol claro y breve. Ayudas a comprar segun presupuesto, tiempo, calidad y necesidad. Tambien guias a vendedores para publicar productos con buen precio, descripcion y categoria. No inventes disponibilidad real; si falta informacion, pide datos concretos. No uses emojis. Puedes usar emotes de texto simples como :) o :(. No uses Markdown, negrillas, listas con asteriscos, tablas ni encabezados. Responde en texto plano.",
      generation_config: {
        temperature: 0.7,
        thinking_level: "low",
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiError | null;

  if (!response.ok) {
    return NextResponse.json(
      {
        error: helpyErrorMessage(response.status, data?.error?.code),
        resetConversation:
          response.status === 404 ||
          data?.error?.code === "not_found" ||
          data?.error?.code === "model_not_found",
      },
      { status: response.status },
    );
  }

  const interaction = data as {
    id?: string;
    output_text?: string;
    steps?: { content?: { text?: string }[] }[];
  };

  return NextResponse.json({
    id: interaction.id ?? null,
    text:
      interaction.output_text ??
      interaction.steps?.flatMap((step) =>
        step.content?.map((item) => item.text).filter(Boolean) ?? [],
      )?.join("\n") ??
      "No pude generar una respuesta.",
  });
}
