import { createHmac, randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    console.log("🔐 ImageKit auth request received. Checking env vars...");
    console.log("Has PUBLIC_KEY:", !!publicKey);
    console.log("Has PRIVATE_KEY:", !!privateKey);
    console.log("Has URL_ENDPOINT:", !!urlEndpoint);

    // Detailed validation
    const missingVars = [];
    if (!publicKey) {
      missingVars.push("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
      console.error("❌ Missing: NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
    }
    if (!privateKey) {
      missingVars.push("IMAGEKIT_PRIVATE_KEY");
      console.error("❌ Missing: IMAGEKIT_PRIVATE_KEY");
    }
    if (!urlEndpoint) {
      missingVars.push("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
      console.error("❌ Missing: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
    }

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

    // Validate private key is not empty
    if (!privateKey || !privateKey.trim()) {
      console.error("❌ Private key is empty");
      return NextResponse.json(
        {
          error: "ImageKit private key is empty",
          missing: ["IMAGEKIT_PRIVATE_KEY"]
        },
        { status: 500 }
      );
    }

    const token = randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400;
    
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
