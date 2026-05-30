"use client";

import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NotificationItem } from "@/lib/types";

export function listenToNotifications(userId: string, onChange: (items: NotificationItem[]) => void) {
  if (!db) return () => undefined;
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(notificationsQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as NotificationItem));
  });
}

export async function createNotification(userId: string, title: string, body: string) {
  if (!db) return;
  await addDoc(collection(db, "notifications"), {
    userId,
    title,
    body,
    unread: true,
    createdAt: serverTimestamp()
  });
}
