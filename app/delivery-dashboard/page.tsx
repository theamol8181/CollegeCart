import type { Metadata } from "next";
import { DeliveryDashboard } from "@/components/delivery/delivery-dashboard";

export const metadata: Metadata = {
  title: "Delivery Partner Dashboard"
};

export default function DeliveryDashboardPage() {
  return <DeliveryDashboard />;
}
