import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
      },
      process.env.CLOUDINARY_API_SECRET || ""
    );

    console.log("✅ Cloudinary signature generated");

    return NextResponse.json({
      signature,
      timestamp,
    });
  } catch (error) {
    console.error("❌ Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { 
        message: "Failed to generate upload signature",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
