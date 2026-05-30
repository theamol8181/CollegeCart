import type { Metadata } from "next";
import { ProfileShell } from "@/components/profile/profile-shell";

export const metadata: Metadata = {
  title: "Profile"
};

export default function ProfilePage() {
  return <ProfileShell />;
}
