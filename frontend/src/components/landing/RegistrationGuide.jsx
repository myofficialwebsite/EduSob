import { motion } from "framer-motion";
import { Smartphone, Image as ImageIcon, FileText, BellRing, Check } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

export const RegistrationGuide = () => {
  const { t } = useLang();

  const guides = [
    {
      step: "১",
      title: "সঠিক মোবাইল নম্বর ব্যবহার",
      desc: "সচল ১১ ডিজিটের মোবাইল নম্বর দিন। আপনার অ্যাকাউন্টের নিরাপত্তা ও রেজাল্ট নোটিফিকেশন এই নম্বরে পাঠানো হবে।",
      icon: <Smartphone className="h-6 w-6 text-orange-400" />
    },
    {
      step: "২",
      title: "ছবি ও স্বাক্ষর আপলোড (স্বয়ংক্রিয় রিসাইজ)",
      desc: "পাসপোর্ট সাইজ ছবি ও স্বাক্ষর আপলোড করলে সিস্টেম স্বয়ংক্রিয়ভাবে ভর্তি ও পরীক্ষার নির্ধারিত মাপে রিসাইজ করবে।",
      icon: <ImageIcon className="h-6 w-6 text-teal-400" />
    },
    {
      step: "৩",
      title: "শিক্ষাগত তথ্য ও রোল সংরক্ষণ",
      desc: "আপনার বর্তমান শ্রেণি, বোর্ড, পরীক্ষার রোল ও রেজিস্ট্রেশন নম্বর নিরাপদে সংরক্ষণ করুন দ্রুত রেজাল্ট প্রাপ্তির জন্য।",
      icon: <FileText className="h-6 w-6 text-amber-400" />
    },
    {
      step: "৪",
      title: "ড্যাশবোর্ড ও নোটিফিকেশন অ্যাক্টিভেশন",
      desc: "রেজিস্ট্রেশন সম্পন্ন হলেই আপনার পারসোনালাইজড ড্যাশবোর্ড সক্রিয় হবে এবং সকল সার্ভিস এক ক্লিকে আনলক হবে।",
      icon: <BellRing className="h-6 w-6 text-indigo-400" />
    }
  ];

  return (
    <section id="guide" className="relative bg-[#0d1017] py-24 border-b border-white/5">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            {t("guideKicker")}
          </span>
          <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {t("guideTitle")}
          </h2>
          <p className="font-bangla mt-2 text-sm text-slate-400">
            {t("guideSub")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((g, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE }}
              className="relative rounded-2xl border border-white/[0.08] bg-[#121620] p-6 hover:border-orange-500/30 transition-all"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                {g.icon}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold font-mono">
                  {g.step}
                </span>
                <h3 className="font-bangla text-base font-bold text-white">
                  {g.title}
                </h3>
              </div>
              <p className="font-bangla text-xs leading-relaxed text-slate-400">
                {g.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-[#121620]/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bangla text-base font-bold text-white">কোনো সাবস্ক্রিপশন ফি নেই</h4>
              <p className="font-bangla text-xs text-slate-400">এডুসব প্ল্যাটফর্মে স্টুডেন্ট অ্যাকাউন্ট খোলা ও মূল সেবাগুলো ব্যবহার সম্পূর্ণ ফ্রি।</p>
            </div>
          </div>
          <button
            onClick={() => scrollToId("enroll")}
            className="font-bangla shrink-0 rounded-full bg-orange-500 px-7 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-orange-600"
          >
            ফ্রি অ্যাকাউন্ট খুলুন
          </button>
        </div>
      </div>
    </section>
  );
};
