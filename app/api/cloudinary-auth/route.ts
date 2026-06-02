import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function normalizeFolder(folder: unknown) {
  if (typeof folder !== "string") return "";
  return folder.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const missing = [
      ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudName],
      ["NEXT_PUBLIC_CLOUDINARY_API_KEY", apiKey],
      ["CLOUDINARY_API_SECRET", apiSecret],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length) {
      return NextResponse.json(
        {
          message: "Cloudinary is not configured.",
          missing,
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const folder = normalizeFolder((body as { folder?: unknown }).folder);
    const timestamp = Math.floor(Date.now() / 1000);
    const uploadParams: Record<string, string | number> = { timestamp };
    if (folder) uploadParams.folder = folder;

    const signature = cloudinary.utils.api_sign_request(uploadParams, apiSecret as string);

    console.log("Cloudinary signature generated", { folder: folder || "(root)" });

    return NextResponse.json({
      apiKey,
      cloudName,
      signature,
      timestamp,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { 
        message: "Failed to generate upload signature",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
