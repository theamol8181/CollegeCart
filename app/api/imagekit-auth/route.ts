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
    console.error("Available env vars:", {
      hasPublicKey: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasUrlEndpoint: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    });
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
    
    // Validate private key is not empty
    if (!privateKey || privateKey.trim().length === 0) {
      throw new Error("Private key is empty");
    }
    
    const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

    console.log("✅ ImageKit auth generated successfully", {
      token: token.slice(0, 8) + "...",
      expire,
      publicKeyPrefix: (publicKey as string).slice(0, 15) + "..."
    });
    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey
    });
  } catch (error) {
    console.error("❌ Error generating ImageKit auth:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Failed to generate upload authentication",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
