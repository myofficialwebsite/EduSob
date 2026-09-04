import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, X, ExternalLink, Check, Sparkles, BookOpen, Layers } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";
import { EDUSOB_SERVICES } from "../../data/edusob";

const EASE = [0.16, 1, 0.3, 1];

export const Courses = () => {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const tabs = [
    { id: "all", label: "সবগুলো (৮)" },
    { id: "exam", label: "পরীক্ষা ও রেজাল্ট" },
    { id: "prep", label: "প্রস্তুতি ও পড়াশোনা" },
    { id: "career", label: "ক্যারিয়ার ও সিভি" },
  ];

  const filtered = useMemo(() => {
    return EDUSOB_SERVICES.filter((s) => {
      const matchesTab = activeTab === "all" || s.category === activeTab;
      const matchesQuery =
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

  return (
    <section id="services" className="relative bg-[#0d1017] py-24 border-y border-white/5">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              {t("servicesKicker")}
            </span>
            <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {t("servicesTitle")}
            </h2>
            <p className="font-bangla mt-2 max-w-xl text-sm text-slate-400">
              {t("servicesSub")}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#121620] p-1.5 select-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-bangla rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="সার্ভিস বা ফিচার সার্চ করুন (যেমন: রেজাল্ট, সিভি, MCQ)..."
              className="font-bangla w-full rounded-2xl border border-white/10 bg-[#121620]/80 py-3 pl-11 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
              className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121620] p-6 transition-all duration-300 hover:border-orange-500/40 hover:bg-[#161c29]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                    {s.icon}
                  </div>
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-orange-300">
                    {s.badge}
                  </span>
                </div>

                <h3 className="font-bangla text-lg font-bold text-white transition-colors duration-300 group-hover:text-orange-300">
                  {s.title}
                </h3>
                <p className="font-bangla mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  {s.description}
                </p>

                {/* Micro Features */}
                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                  {s.features.slice(0, 2).map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-[11px] text-slate-400 font-bangla">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(s)}
                  className="font-bangla flex items-center gap-1.5 text-xs font-bold text-orange-400 transition-all duration-300 hover:text-orange-300 group-hover:translate-x-1"
                >
                  <span>{s.actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  {s.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="font-bangla text-base">আপনার অনুসন্ধানের সাথে কোনো সেবা পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#121620] p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-2xl">
                  {selectedService.icon}
                </div>
                <div>
                  <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-extrabold text-orange-300">
                    {selectedService.badge}
                  </span>
                  <h3 className="font-bangla text-xl font-bold text-white mt-1">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              <p className="font-bangla text-sm text-slate-300 leading-relaxed mb-6">
                {selectedService.description}
              </p>

              <div className="mb-6 rounded-2xl border border-white/10 bg-[#090b0f] p-4">
                <h4 className="font-bangla text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  মূল সুবিধাসমূহ:
                </h4>
                <div className="space-y-2.5">
                  {selectedService.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-bangla text-slate-300">
                      <Check className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    scrollToId("enroll");
                  }}
                  className="font-bangla flex-1 rounded-full bg-orange-500 py-3 text-center text-xs font-bold text-white shadow-lg transition hover:bg-orange-600"
                >
                  ফ্রি অ্যাক্সেস নিন
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  className="font-bangla rounded-full border border-white/15 px-5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
