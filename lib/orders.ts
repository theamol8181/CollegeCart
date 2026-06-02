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

export type OrderStatus = "pending" | "accepted" | "rejected" | "delivered" | "cancelled";

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
      return { id: docSnap.id, ...docSnap.data() } as Order;
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
      where("buyerId", "==", buyerId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
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
      where("sellerId", "==", sellerId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
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
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
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
