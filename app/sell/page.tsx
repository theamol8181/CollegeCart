import type { Metadata } from "next";
import { ListingForm } from "@/components/product/listing-form";

export const metadata: Metadata = {
  title: "Sell Product"
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Create listing</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-ink dark:text-white">Sell to students nearby</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Add sharp photos, honest condition details, and a campus pickup location.
        </p>
      </div>
      <ListingForm />
    </div>
  );
}
