"use client";

import { MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { demoUser } from "@/lib/data";

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

interface Chat {
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unread: number;
}

export function MessagingShell() {
  const { user } = useAuthStore();
  const { products } = useMarketplaceStore();
  const currentUser = user ?? demoUser;
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Get unique sellers from products (excluding current user)
  const sellers = Array.from(
    products
      .filter((product) => product.status === "approved" && product.sellerId !== currentUser.uid)
      .reduce((map, product) => {
        if (!map.has(product.sellerId)) {
          map.set(product.sellerId, {
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            sellerAvatar: product.sellerAvatar,
            lastMessage: undefined,
            lastMessageTime: undefined,
            unread: 0
          });
        }
        return map;
      }, new Map())
      .values()
  );

  function sendMessage() {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      from: currentUser.uid,
      to: selectedChat.sellerId,
      content: messageInput,
      timestamp: Date.now()
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    
    // Update chat
    setSelectedChat({
      ...selectedChat,
      lastMessage: messageInput,
      lastMessageTime: Date.now()
    });
  }

  function startChat(seller: Chat) {
    setSelectedChat(seller);
    // Load messages for this chat from localStorage
    const stored = localStorage.getItem(`chat-${currentUser.uid}-${seller.sellerId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  }

  function closeChat() {
    // Save messages to localStorage
    if (selectedChat) {
      localStorage.setItem(
        `chat-${currentUser.uid}-${selectedChat.sellerId}`,
        JSON.stringify(messages)
      );
    }
    setSelectedChat(null);
  }

  if (sellers.length === 0) {
    return (
      <section className="grid min-h-[520px] place-items-center rounded-[2rem] bg-white p-8 text-center shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
        <div className="max-w-md">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ocean/10 text-ocean">
            <MessageCircle className="size-8" />
          </span>
          <h1 className="mt-5 text-3xl font-black text-ink dark:text-white">No sellers available</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Seller conversations will appear here when you browse products.
          </p>
        </div>
      </section>
    );
  }

  if (selectedChat) {
    return (
      <div className="flex h-[600px] flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white shadow-premium dark:border-white/10 dark:bg-white/[0.08]">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src={selectedChat.sellerAvatar}
              alt={selectedChat.sellerName}
              width={40}
              height={40}
              unoptimized={selectedChat.sellerAvatar.startsWith("data:")}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-ink dark:text-white">{selectedChat.sellerName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Seller</p>
            </div>
          </div>
          <button onClick={closeChat} className="grid size-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === currentUser.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 ${
                    msg.from === currentUser.uid
                      ? "bg-ocean text-white"
                      : "bg-slate-100 text-ink dark:bg-white/10 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.from === currentUser.uid ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
            <button
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              className="grid size-10 place-items-center rounded-xl bg-ocean text-white transition disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-premium dark:border-white/10 dark:bg-white/[0.08]">
      <h2 className="font-black text-ink dark:text-white">Available Sellers</h2>
      <div className="grid gap-2">
        {sellers.map((seller) => (
          <button
            key={seller.sellerId}
            onClick={() => startChat(seller)}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src={seller.sellerAvatar}
                alt={seller.sellerName}
                width={40}
                height={40}
                unoptimized={seller.sellerAvatar.startsWith("data:")}
                className="size-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink dark:text-white">{seller.sellerName}</p>
                {seller.lastMessage ? (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{seller.lastMessage}</p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start a conversation</p>
                )}
              </div>
            </div>
            {seller.unread > 0 && (
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                {seller.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
