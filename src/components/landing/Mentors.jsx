import { motion } from "framer-motion";
import { GraduationCap, Award, MessageSquare } from "lucide-react";
import { scrollToId } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const MENTORS = [
  {
    name: "ড. তানভীর আহমেদ",
    subject: "উচ্চতর গণিত ও পদার্থবিজ্ঞান",
    institute: "বুয়েট অ্যালামনাই ও সিনিয়র একাডেমি মেন্টর",
    img: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?crop=entropy&cs=srgb&fm=jpg&w=500&auto=format&fit=crop&q=75",
    exp: "১০+ বছরের অভিজ্ঞতা",
    helped: "৪,৫০০+ সমাধান",
  },
  {
    name: "ফারহানা ইসলাম",
    subject: "ইংরেজি ও বিশ্ববিদ্যালয় ভর্তি গাইডলাইন",
    institute: "ইংরেজি বিভাগ, ঢাকা বিশ্ববিদ্যালয়",
    img: "https://images.unsplash.com/photo-1590650213165-c1fef80648c4?crop=entropy&cs=srgb&fm=jpg&w=500&auto=format&fit=crop&q=75",
    exp: "৮+ বছরের অভিজ্ঞতা",
    helped: "৩,২০০+ সমাধান",
  },
  {
    name: "মোঃ রাকিব হাসান",
    subject: "রসায়ন ও জীববিজ্ঞানের জটিল ধারণা",
    institute: "মেডিকেল ও বোর্ড একাডেমি বিশেষজ্ঞ",
    img: "https://images.unsplash.com/photo-1758685848404-5b2bf607b38d?crop=entropy&cs=srgb&fm=jpg&w=500&auto=format&fit=crop&q=75",
    exp: "৭+ বছরের অভিজ্ঞতা",
    helped: "২,৮০০+ সমাধান",
  },
];

export const Mentors = () => {
  return (
    <section id="mentors" className="py-20 lg:py-28 bg-[#0b0d12] border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 text-center max-w-2xl mx-auto"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            ১-অন-১ শিক্ষক ও মেন্টর প্যানেল
          </span>
          <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            অভিজ্ঞ শিক্ষকদের সরাসরি দিকনির্দেশনা
          </h2>
          <p className="font-bangla mt-2 text-sm text-slate-400">
            যেকোনো অধ্যায়ের ডাউট জমা দিন এবং অভিজ্ঞ শিক্ষকদের কাছ থেকে ধাপে ধাপে লিখিত ও ভয়েস সমাধান পান।
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121620] p-6 hover:border-orange-500/40 transition-all duration-300"
            >
              <div className="mb-4 flex items-center gap-4">
                <img
                  src={m.img}
                  alt={m.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                />
                <div>
                  <h3 className="font-bangla text-base font-bold text-white group-hover:text-orange-300 transition">
                    {m.name}
                  </h3>
                  <p className="font-bangla text-xs text-orange-400 font-semibold">{m.subject}</p>
                  <p className="font-bangla text-[11px] text-slate-500 mt-0.5">{m.institute}</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-slate-400 font-bangla">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  {m.exp}
                </span>
                <span className="text-emerald-400 font-bold">{m.helped}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => scrollToId("enroll")}
            className="font-bangla inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-2.5 text-xs font-bold text-orange-300 hover:bg-orange-500 hover:text-white transition"
          >
            <MessageSquare className="h-4 w-4" />
            <span>শিক্ষকের কাছে প্রশ্ন জমা দিন</span>
          </button>
        </div>
      </div>
    </section>
  );
};
