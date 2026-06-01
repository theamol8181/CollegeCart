import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await request.json();
    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    if (!keyId || !keySecret) {
      console.error("❌ Razorpay credentials not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    });

    console.log(`✅ Order created: ${order.id}, Amount: ${amount} ${currency}`);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: `Failed to create order: ${errorMsg}` },
      { status: 500 }
    );
  }
}
