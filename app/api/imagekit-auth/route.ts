import { createHmac, randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json({ error: "ImageKit is not configured." }, { status: 500 });
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey
  });
}
