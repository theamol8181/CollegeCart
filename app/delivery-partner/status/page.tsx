import type { Metadata } from "next";
import { DeliveryPartnerStatus } from "@/components/delivery/delivery-partner-status";

export const metadata: Metadata = {
  title: "Delivery Partner Status"
};

export default function StatusPage() {
  return <DeliveryPartnerStatus />;
}
