import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useLang } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const FAQS = [
  {
    q: "কোর্সের সময়সূচি কী রকম?",
    a: "প্রতিটি ব্যাচে সাপ্তাহে ৩টি লাইভ ক্লাস হয় (রাত ৮টা–১০টা)। সব ক্লাসের রেকর্ডিং লাইফটাইম অ্যাক্সেসসহ পাবেন, তাই চাকরিজীবীদের জন্যও সুবিধাজনক।",
  },
  {
    q: "কীভাবে ভর্তি হবো?",
    a: "নিচের ভর্তি ফর্মটি পূরণ করুন অথবা পছন্দের কোর্সে 'সিট বুক করুন' ক্লিক করুন। আমাদের টিম ২৪ ঘণ্টার মধ্যে কল করে পেমেন্ট ও ব্যাচের বিস্তারিত জানিয়ে দেবে। bKash, Nagad ও কার্ড — সব মাধ্যমেই পেমেন্ট করা যায়।",
  },
  {
    q: "সার্টিফিকেট দেওয়া হয় কি?",
    a: "হ্যাঁ! কোর্স সফলভাবে শেষ করলে ভেরিফায়েড সার্টিফিকেট পাবেন, যা LinkedIn ও সিভিতে যুক্ত করতে পারবেন। ফাইনাল প্রজেক্ট রিভিউ পাস করা বাধ্যতামূলক।",
  },
  {
    q: "টাকা ফেরতের নীতি (Refund Policy) কী?",
    a: "প্রথম ৭ দিনের মধ্যে কোর্সটি আপনার জন্য না মনে হলে ১০০% টাকা ফেরত দেওয়া হয় — কোনো প্রশ্ন ছাড়াই।",
  },
  {
    q: "সম্পূর্ণ বিগিনাররা কি করতে পারবে?",
    a: "অবশ্যই! আমাদের বেশিরভাগ কোর্স জিরো থেকে শুরু করার জন্য ডিজাইন করা। প্রি-রেকর্ডেড ফাউন্ডেশন মডিউল ও ১:১ মেন্টর সাপোর্ট থাকায় পিছিয়ে পড়ার ভয় নেই।",
  },
];

const FaqItem = ({ item, index, open, onToggle }) => (
  <div
    data-testid={`faq-accordion-item-${index}`}
    className={`overflow-hidden rounded-2xl border transition-colors duration-500 ${
      open ? "border-orange-500/40 bg-[#121620]" : "border-white/[0.08] bg-[#121620]/60"
    }`}
  >
    <button
      data-testid={`faq-question-${index}`}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
    >
      <span className="font-bangla text-sm font-semibold text-white sm:text-base">{item.q}</span>
      <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }} className="shrink-0 text-orange-400">
        <Plus className="h-5 w-5" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <p className="font-bangla px-6 pb-6 text-sm leading-relaxed text-slate-400">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const FAQ = () => {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = FAQS.filter(
    (f) => f.q.includes(query) || f.a.includes(query)
  );

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-12 text-center"
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90">{t("faqKicker")}</p>
          <h2 className="font-bangla text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="faq-title">
            {t("faqTitle")}
          </h2>
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              data-testid="faq-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="প্রশ্ন খুঁজুন..."
              className="font-bangla w-full rounded-full border border-white/10 bg-[#121620] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          {filtered.map((f, i) => (
            <FaqItem
              key={f.q}
              item={f}
              index={i}
              open={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="font-bangla py-10 text-center text-slate-500" data-testid="faq-empty-state">
              কোনো উত্তর পাওয়া যায়নি।
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
