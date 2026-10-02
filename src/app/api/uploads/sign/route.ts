import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { requireSocio } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const uid = await requireSocio(req);
  if (typeof uid === "object") return uid;

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "renova/products";
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}