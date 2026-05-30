export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <h1 className="text-3xl font-black text-ink dark:text-white mb-6">Terms and Conditions</h1>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-2">Last Updated: May 2026</p>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4">By using CollegeCart, you agree to the following terms.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Marketplace Nature</h2>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>CollegeCart acts only as a platform connecting buyers and sellers.</li>
          <li>CollegeCart does not own, inspect, guarantee, or endorse products listed by users.</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">User Eligibility</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">Users must:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Be at least 13 years old</li>
          <li>Provide accurate account information</li>
          <li>Follow applicable laws and college regulations</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Prohibited Listings</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">Users may not list:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Illegal items</li>
          <li>Counterfeit products</li>
          <li>Weapons</li>
          <li>Drugs or controlled substances</li>
          <li>Stolen property</li>
          <li>Adult content</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Transactions</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">Buyers and sellers are responsible for:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Product verification</li>
          <li>Meeting arrangements</li>
          <li>Payment agreements</li>
        </ul>
        <p className="text-slate-600 dark:text-slate-300 mb-4">CollegeCart is not responsible for disputes, losses, damages, or fraudulent transactions between users.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Content Moderation</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">CollegeCart reserves the right to remove listings, suspend accounts, or restrict access to maintain platform safety.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Changes</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">These terms may be updated at any time without prior notice.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Contact</h2>
        <p className="text-slate-600 dark:text-slate-300">Email: <a href="mailto:support@collegecart.online" className="text-ocean font-semibold">support@collegecart.online</a></p>
      </div>
    </section>
  );
}
