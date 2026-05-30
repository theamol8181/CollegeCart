export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <h1 className="text-3xl font-black text-ink dark:text-white mb-6">Privacy Policy</h1>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-2">Last Updated: May 2026</p>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4">Welcome to CollegeCart.</p>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4">CollegeCart is a student marketplace that allows users to buy and sell products across Bangalore colleges.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Information We Collect</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">We may collect:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>College name</li>
          <li>Profile photo</li>
          <li>Product listings and uploaded images</li>
          <li>Messages and marketplace activity</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">How We Use Information</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-3">We use collected information to:</p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>Create and manage accounts</li>
          <li>Verify student identities</li>
          <li>Display product listings</li>
          <li>Improve platform security</li>
          <li>Provide customer support</li>
        </ul>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Data Security</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">We take reasonable measures to protect user information. However, no online platform can guarantee complete security.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Third-Party Services</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">CollegeCart may use services such as Firebase, ImageKit, Vercel, and analytics providers to operate the platform.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">User Responsibility</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Users are responsible for the accuracy of information they provide and for ensuring that listed products comply with applicable laws and college policies.</p>

        <h2 className="text-lg font-black text-ink dark:text-white mt-6 mb-3">Contact</h2>
        <p className="text-slate-600 dark:text-slate-300">For privacy-related questions: <a href="mailto:support@collegecart.online" className="text-ocean font-semibold">support@collegecart.online</a></p>
      </div>
    </section>
  );
}
