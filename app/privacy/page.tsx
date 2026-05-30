export default function PrivacyPage() {
  return <InfoPage title="Privacy Policy" body="CollegeCart student data ko marketplace, chat, profile, and safety workflows ke liye use karta hai. Private keys frontend me expose nahi hoti." />;
}

function InfoPage({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <h1 className="text-3xl font-black text-ink dark:text-white">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
    </section>
  );
}
