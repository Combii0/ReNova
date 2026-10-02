import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Google Maps not configured" }, { status: 500 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
    body: JSON.stringify({ input: q, languageCode: "es", includedRegionCodes: ["co"] }),
  });
  if (!res.ok) return NextResponse.json({ error: "Places request failed" }, { status: 502 });

  const data = await res.json();
  const suggestions = (data.suggestions ?? [])
    .filter((s: { placePrediction?: unknown }) => s.placePrediction)
    .map((s: { placePrediction: { placeId: string; text: { text: string } } }) => ({
      placeId: s.placePrediction.placeId,
      text: s.placePrediction.text.text,
    }));

  return NextResponse.json(suggestions);
}