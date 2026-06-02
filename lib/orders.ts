"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, UserProfile } from "@/lib/types";

export type OrderStatus = "processing" | "on_way" | "delivered";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsApp: string;
  status: OrderStatus;
  buyerNotes?: string;
  adminNotes?: string;
  whatsappLink?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeOrderStatus(status: unknown): OrderStatus {
  if (status === "on_way" || status === "delivered") return status;
  return "processing";
}

function normalizeOrderDate(value: unknown) {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

function normalizeOrderPrice(data: Record<string, any>) {
  const value = data.productPrice ?? data.price ?? data.totalAmount ?? 0;
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
}

function toOrder(id: string, data: Record<string, any>): Order {
  return {
    id,
    ...data,
    productId: data.productId ?? "",
    productName: data.productName ?? "CollegeCart order",
    productImage: data.productImage ?? "",
    productPrice: normalizeOrderPrice(data),
    buyerId: data.buyerId ?? "",
    buyerName: data.buyerName ?? "Buyer",
    buyerPhone: data.buyerPhone ?? "",
    buyerEmail: data.buyerEmail ?? "",
    sellerId: data.sellerId ?? "",
    sellerName: data.sellerName ?? "Seller",
    sellerPhone: data.sellerPhone ?? "",
    sellerWhatsApp: data.sellerWhatsApp ?? "",
    status: normalizeOrderStatus(data.status),
    createdAt: normalizeOrderDate(data.createdAt),
    updatedAt: normalizeOrderDate(data.updatedAt ?? data.createdAt),
  } as Order;
}

export async function createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  try {
    const now = new Date().toISOString();
    const orderRef = doc(collection(db, "orders"));

    const orderData = {
      ...order,
      createdAt: now,
      updatedAt: now,
    };

    console.log("✅ Creating order:", {
      productName: order.productName,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    await setDoc(orderRef, orderData);
    return orderRef.id;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return toOrder(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}

export function listenToBuyerOrders(buyerId: string, onChange: (orders: Order[]) => void) {
  if (!db) return () => undefined;

  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("buyerId", "==", buyerId)
    );

    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs
        .map((doc) => toOrder(doc.id, doc.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log(`📦 Buyer orders: ${orders.length}`);
      onChange(orders);
    });
  } catch (error) {
    console.error("❌ Error setting up buyer orders listener:", error);
    return () => undefined;
  }
}

export function listenToSellerOrders(sellerId: string, onChange: (orders: Order[]) => void) {
  if (!db) return () => undefined;

  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("sellerId", "==", sellerId)
    );

    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs
        .map((doc) => toOrder(doc.id, doc.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log(`📦 Seller orders: ${orders.length}`);
      onChange(orders);
    });
  } catch (error) {
    console.error("❌ Error setting up seller orders listener:", error);
    return () => undefined;
  }
}

export function listenToAllOrders(onChange: (orders: Order[]) => void) {
  if (!db) return () => undefined;

  try {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map((doc) => toOrder(doc.id, doc.data()));
      console.log(`📦 All orders: ${orders.length}`);
      onChange(orders);
    });
  } catch (error) {
    console.error("❌ Error setting up all orders listener:", error);
    return () => undefined;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, adminNotes?: string) {
  if (!db) throw new Error("Firebase not initialized");

  try {
    const orderRef = doc(db, "orders", orderId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (adminNotes) {
      updates.adminNotes = adminNotes;
    }

    await updateDoc(orderRef, updates);
    console.log(`✅ Order ${orderId} status updated to: ${status}`);
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    throw error;
  }
}
