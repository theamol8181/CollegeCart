import type { Metadata } from "next";
import { DeliveryPartnerForm } from "@/components/delivery/delivery-partner-form";

export const metadata: Metadata = {
  title: "Become a Delivery Partner"
};

export default function DeliveryPartnerPage() {
  return <DeliveryPartnerForm />;
}
