export default function SupportPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <h1 className="text-3xl font-black text-ink dark:text-white mb-6">Support</h1>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-slate-600 dark:text-slate-300 mb-4">Need help with CollegeCart? Our support team is available to assist you.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Contact Information</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Email: <a href="mailto:support@collegecart.online" className="text-ocean font-semibold">support@collegecart.online</a>
        </p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">We Can Help With</h2>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Account issues</li>
          <li>Login problems</li>
          <li>Listing approval requests</li>
          <li>Reporting suspicious users</li>
          <li>Product listing errors</li>
          <li>Verification issues</li>
          <li>Technical bugs</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Response Time</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Typical response time: 24–48 hours.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Report Abuse</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">If you believe a listing violates our policies, please email:</p>
        <p className="text-slate-600 dark:text-slate-300 mb-3">
          <a href="mailto:support@collegecart.online" className="text-ocean font-semibold">support@collegecart.online</a>
        </p>
        
        <p className="text-slate-600 dark:text-slate-300 mb-3">Include:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Product title</li>
          <li>Seller name</li>
          <li>Screenshot (if available)</li>
          <li>Reason for report</li>
        </ul>

        <p className="text-slate-600 dark:text-slate-300">Thank you for helping keep CollegeCart safe for students.</p>
      </div>
    </section>
  );
}
