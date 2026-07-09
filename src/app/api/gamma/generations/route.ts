import { NextRequest, NextResponse } from "next/server";

const gammaBaseUrl = "https://public-api.gamma.app/v1.0";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMMA_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const response = await fetch(`${gammaBaseUrl}/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
