import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Partner Dashboard"
};

export default function DeliveryDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-[2rem] border-2 border-coral/30 bg-coral/5 p-8 text-center">
        <h1 className="text-3xl font-black text-ink dark:text-white">
          Delivery Features Unavailable
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          In our MVP version, delivery is managed manually by the CollegeCart team through WhatsApp coordination. Delivery partner assignments and tracking are handled directly by our admin team.
        </p>
        <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          For delivery inquiries, please contact us via WhatsApp: <a href="https://wa.me/919421818224" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">+91 94218 18224</a>
        </p>
      </div>
    </div>
  );
}
