import { NextResponse } from "next/server";

const gammaBaseUrl = "https://public-api.gamma.app/v1.0";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GAMMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GAMMA_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const { id } = await params;
  const response = await fetch(`${gammaBaseUrl}/generations/${id}`, {
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

