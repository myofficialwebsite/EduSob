const ITEMS = [
  "শিক্ষার সব, এক ঠিকানায়",
  "বোর্ড ও বিশ্ববিদ্যালয় রেজাল্ট হাব",
  "১-অন-১ শিক্ষক সহায়তা",
  "৫০,০০০+ প্রশ্নব্যাংক ও MCQ",
  "প্রফেশনাল সিভি মেকার",
  "১০০% ফ্রি শিক্ষার্থী ড্যাশবোর্ড",
  "স্কলারশিপ ও উপবৃত্তি ট্র্যাকার",
];

export const Marquee = () => {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/5 bg-[#0d1017] py-6" data-testid="editorial-marquee">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {[...row, ...row].map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-bangla font-display text-2xl font-bold uppercase tracking-wide text-outline sm:text-3xl">
              {item}
            </span>
            <span className="h-2 w-2 rotate-45 bg-orange-500/60" />
          </span>
        ))}
      </div>
    </div>
  );
};
