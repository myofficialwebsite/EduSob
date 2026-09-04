import { motion } from "framer-motion";
import { BookOpen, Users, Briefcase, Rocket } from "lucide-react";
import { useLang } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const CHAPTERS = [
  {
    num: "01",
    icon: BookOpen,
    title: "ইন্ডাস্ট্রি-ফোকাসড কারিকুলাম",
    desc: "বাজারের চাহিদা অনুযায়ী প্রতিটি মডিউল ডিজাইন করা — যা শিখবেন, তা-ই কাজে লাগবেন।",
    span: "md:col-span-7",
  },
  {
    num: "02",
    icon: Users,
    title: "১:১ ডেডিকেটেড মেন্টর সাপোর্ট",
    desc: "Discord ও Zoom-এ সরাসরি মেন্টরের সাথে কথা বলুন, প্রতিটি ডাউট ক্লিয়ার করুন।",
    span: "md:col-span-5",
  },
  {
    num: "03",
    icon: Briefcase,
    title: "রিয়েল-ওয়ার্ল্ড প্রজেক্ট পোর্টফোলিও",
    desc: "৫+ বাস্তব প্রজেক্ট বানিয়ে GitHub পোর্টফোলিও তৈরি করুন যা রিক্রুটারদের ইমপ্রেস করে।",
    span: "md:col-span-5",
  },
  {
    num: "04",
    icon: Rocket,
    title: "ক্যারিয়ার ট্র্যাকিং ও জব প্লেসমেন্ট",
    desc: "৫০০+ হায়ারিং পার্টনার নেটওয়ার্কে সিভি পৌঁছে দিই, ইন্টারভিউ পর্যন্ত সাথে থাকি।",
    span: "md:col-span-7",
  },
];

export const Manifesto = () => {
  const { t } = useLang();
  return (
    <section id="manifesto" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-14 max-w-2xl"
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90" data-testid="manifesto-kicker">
            {t("manifestoKicker")}
          </p>
          <h2 className="font-bangla text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="manifesto-title">
            {t("manifestoTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
          {CHAPTERS.map((c, i) => (
            <motion.div
              key={c.num}
              data-testid={`manifesto-chapter-${c.num}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              whileHover={{ scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121620] p-6 transition-colors duration-500 hover:border-orange-500/40 lg:p-8 ${c.span}`}
            >
              <div className="absolute -right-4 -top-6 font-display text-[7rem] font-extrabold leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-orange-500/10">
                {c.num}
              </div>
              <div className="relative">
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors duration-500 group-hover:bg-orange-500/20">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="font-mono-code mb-2 text-[11px] tracking-widest text-orange-400/80">{c.num} /</p>
                <h3 className="font-bangla mb-3 text-xl font-semibold text-white sm:text-2xl">{c.title}</h3>
                <p className="font-bangla text-sm leading-relaxed text-slate-400">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
