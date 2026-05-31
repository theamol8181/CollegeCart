import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay key secret not configured");
      return NextResponse.json(
        { error: "Payment verification not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    if (hash !== razorpay_signature) {
      console.error("❌ Payment signature mismatch");
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    console.log(`✅ Payment verified: ${razorpay_payment_id}`);

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: `Payment verification failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
