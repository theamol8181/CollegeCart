import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://collegecart.vercel.app"),
  title: {
    default: "CollegeCart - Campus Marketplace",
    template: "%s | CollegeCart"
  },
  description:
    "Buy and sell books, electronics, cycles, notes, furniture, and hostel essentials inside your campus.",
  manifest: "/manifest.json",
  openGraph: {
    title: "CollegeCart",
    description: "A premium campus marketplace for students.",
    url: "https://collegecart.vercel.app",
    siteName: "CollegeCart",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeCart",
    description: "A premium campus marketplace for students."
  }
};
