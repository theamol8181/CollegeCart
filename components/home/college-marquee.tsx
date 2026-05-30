const colleges = [
  "MS Ramaiah Institute of Technology",
  "RV College of Engineering",
  "BMS College of Engineering",
  "PES University",
  "Christ University",
  "Jain University",
  "Dayananda Sagar University",
  "Bangalore Institute of Technology",
  "New Horizon College",
  "CMR Institute of Technology"
];

export function CollegeMarquee() {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/[0.82] py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <div className="flex whitespace-nowrap">
        <div className="animate-[marquee_28s_linear_infinite]">
          {[...colleges, ...colleges].map((college, index) => (
            <span key={`${college}-${index}`} className="mx-5 text-sm font-black text-slate-700 dark:text-slate-100">
              Available for {college}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
