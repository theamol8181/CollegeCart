import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      productImage,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      price,
      deliveryCharge,
      collegeName,
      pickupLocation,
      dropLocation,
      paymentMethod,
      deliveryMethod,
      razorpayOrderId,
    } = body;

    // Validate required fields
    if (
      !productId ||
      !sellerId ||
      !buyerId ||
      !price ||
      !collegeName ||
      !deliveryMethod ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate minimum amount (100 paise = ₹1)
    const totalAmount =
      paymentMethod === "cod"
        ? price + deliveryCharge + 10 // ₹10 COD handling charge
        : price + deliveryCharge;

    if (totalAmount < 100) {
      return NextResponse.json(
        { error: "Order amount must be at least ₹1" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Firebase is not configured" },
        { status: 503 }
      );
    }

    // Verify product exists
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create order document
    const ordersRef = collection(db, "orders");
    const orderData = {
      productId,
      productName,
      productImage,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      deliveryPartnerId: null,
      deliveryPartnerName: null,
      price: parseFloat(price),
      deliveryCharge: parseFloat(deliveryCharge),
      codHandlingCharge: paymentMethod === "cod" ? 10 : 0,
      totalAmount,
      collegeName,
      pickupLocation,
      dropLocation,
      paymentMethod,
      deliveryMethod,
      status: deliveryMethod === "meet" ? "accepted" : "available",
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, orderData);

    return NextResponse.json(
      {
        success: true,
        orderId: docRef.id,
        order: {
          ...orderData,
          id: docRef.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Firebase is not configured" },
        { status: 503 }
      );
    }

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderSnap.id,
        ...orderSnap.data(),
      },
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
