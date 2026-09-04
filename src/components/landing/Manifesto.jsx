import { motion } from "framer-motion";
import { CheckCircle, Award, Target, Users } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";
import { EDUSOB_STEPS } from "../../data/edusob";

const EASE = [0.16, 1, 0.3, 1];

export const Manifesto = () => {
  const { t } = useLang();

  const pillars = [
    {
      title: "মূল উদ্দেশ্য",
      desc: "বাংলাদেশের প্রতিটি শিক্ষার্থীর শিক্ষা, বোর্ড পরীক্ষার প্রস্তুতি ও ক্যারিয়ার গঠন সহজ ও এক প্ল্যাটফর্মে একত্রিত করা।",
      icon: <Target className="h-5 w-5 text-orange-400" />
    },
    {
      title: "বয়স ও যোগ্যতা",
      desc: "৯ থেকে ৩০ বছর বয়সী স্কুল, কলেজ, মাদ্রাসা, জাতীয় বিশ্ববিদ্যালয় শিক্ষার্থী ও সাধারণ চাকরিপ্রার্থীদের জন্য উন্মুক্ত।",
      icon: <Users className="h-5 w-5 text-teal-400" />
    },
    {
      title: "সেবার ধাপসমূহ",
      desc: "রেজাল্ট ট্র্যাকিং থেকে শুরু করে ১-অন-১ শিক্ষক সহায়তা, সিভি মেকার ও মডেল টেস্ট—সব এক ক্লিকে সমাধান।",
      icon: <CheckCircle className="h-5 w-5 text-amber-400" />
    },
    {
      title: "সুযোগ-সুবিধা",
      desc: "ক্লাউড সিঙ্কযুক্ত পারসোনালাইজড ড্যাশবোর্ড, স্পেসড রিপিটেশন MCQ প্র্যাকটিস ও ১০০% ফ্রি ব্যাকআপ সার্ভার।",
      icon: <Award className="h-5 w-5 text-indigo-400" />
    }
  ];

  return (
    <section id="steps" className="relative bg-[#0b0d12] py-24 border-b border-white/5">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Section 1: Pillars */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              আমাদের লক্ষ্য ও বৈশিষ্ট্য
            </span>
            <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              শিক্ষার্থী ও চাকরিপ্রার্থীদের জন্য একক ডিজিটাল সমাধান
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE }}
                className="rounded-2xl border border-white/10 bg-[#121620] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  {p.icon}
                </div>
                <h3 className="font-bangla text-base font-bold text-white mb-2">
                  {p.title}
                </h3>
                <p className="font-bangla text-xs leading-relaxed text-slate-400">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: The 6 Steps */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              {t("stepsKicker")}
            </span>
            <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {t("stepsTitle")}
            </h2>
            <p className="font-bangla mt-2 text-sm text-slate-400">
              {t("stepsSub")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EDUSOB_STEPS.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
                className="relative rounded-2xl border border-white/[0.08] bg-[#121620] p-6 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    ধাপ {s.step}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-orange-500/40" />
                </div>
                <h3 className="font-bangla text-base font-bold text-white mb-2">
                  {s.title}
                </h3>
                <p className="font-bangla text-xs leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => scrollToId("enroll")}
              className="font-bangla inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 hover:shadow-orange-500/30"
            >
              আজই শুরু করুন (১০০% ফ্রি)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
