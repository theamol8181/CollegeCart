import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sell Product"
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Want to sell?</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-ink dark:text-white">Fill out our seller form</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Tell us about your product. After verification, the CollegeCart team will review and manually publish your listing.
        </p>
      </div>
      
      <div className="glass rounded-[2rem] p-8">
        <div className="mb-6 rounded-2xl border border-ocean/30 bg-ocean/5 p-6">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">📋 Seller Form</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Click the button below to open our seller form. Share details about your product, and our team will review your submission within 24 hours.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean px-8 py-4 text-base font-black text-white shadow-glow hover:opacity-90 transition w-full"
          >
            Open Seller Form
            <ArrowRight className="size-5" />
          </a>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.08]">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">✅ What happens next?</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>1. You submit your product details via the form</li>
              <li>2. Our team reviews your submission</li>
              <li>3. Once approved, your listing appears on CollegeCart</li>
              <li>4. Students can contact you to purchase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
