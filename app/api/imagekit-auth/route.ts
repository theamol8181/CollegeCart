import { createHmac, randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  // Detailed validation
  const missingVars = [];
  if (!publicKey) missingVars.push("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
  if (!privateKey) missingVars.push("IMAGEKIT_PRIVATE_KEY");
  if (!urlEndpoint) missingVars.push("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");

  if (missingVars.length > 0) {
    console.error("❌ ImageKit configuration incomplete. Missing:", missingVars);
    return NextResponse.json(
      {
        error: "ImageKit is not properly configured.",
        missing: missingVars
      },
      { status: 500 }
    );
  }

  try {
    const token = randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400;
    const signature = createHmac("sha1", privateKey!).update(token + expire).digest("hex");

    console.log("✅ ImageKit auth generated successfully");
    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey
    });
  } catch (error) {
    console.error("❌ Error generating ImageKit auth:", error);
    return NextResponse.json(
      { error: "Failed to generate upload authentication" },
      { status: 500 }
    );
  }
}
