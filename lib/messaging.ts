"use client";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  readBy: string[];
  createdAt: unknown;
};

export function listenToThreadMessages(threadId: string, onChange: (messages: ChatMessage[]) => void) {
  if (!db) return () => undefined;
  const messagesQuery = query(collection(db, "messages", threadId, "items"), orderBy("createdAt", "asc"));
  return onSnapshot(messagesQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ChatMessage));
  });
}

export async function sendMessage(threadId: string, senderId: string, text: string) {
  if (!db) return;
  await addDoc(collection(db, "messages", threadId, "items"), {
    senderId,
    text,
    readBy: [senderId],
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, "messages", threadId), {
    lastMessage: text,
    updatedAt: serverTimestamp()
  });
}

export async function setTyping(threadId: string, userId: string, typing: boolean) {
  if (!db) return;
  await updateDoc(doc(db, "messages", threadId), {
    [`typing.${userId}`]: typing,
    updatedAt: serverTimestamp()
  });
}

export async function markThreadRead(threadId: string, userId: string) {
  if (!db) return;
  await updateDoc(doc(db, "messages", threadId), {
    [`unread.${userId}`]: 0,
    updatedAt: serverTimestamp()
  });
}
