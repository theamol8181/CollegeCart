import type { Metadata } from "next";
import { MessagingShell } from "@/components/chat/messaging-shell";

export const metadata: Metadata = {
  title: "Chats coming soon"
};

export default function MessagesPage() {
  return <MessagingShell />;
}
