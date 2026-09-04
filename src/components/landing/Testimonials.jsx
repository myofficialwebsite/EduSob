import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const REVIEWS = [
  {
    name: "তানভীর হোসেন",
    identity: "এইচএসসি পরীক্ষার্থী (ঢাকা বোর্ড)",
    service: "রেজাল্ট ও মার্কশিট হাব",
    quote: "রেজাল্ট প্রকাশের দিন অফিশিয়াল সার্ভার ডাউন থাকার পরও এডুসব-এর ব্যাকআপ লিঙ্ক থেকে রেজাল্ট সবার আগে পেয়েছি। পুরো মার্কশিট সাথে সাথে পিডিএফ সেভ করতে পেরেছি।",
  },
  {
    name: "সাদিয়া তাসনিম",
    identity: "জাতীয় বিশ্ববিদ্যালয় (অনার্স ৩য় বর্ষ)",
    service: "CGPA ক্যালকুলেটর ও প্রশ্নব্যাংক",
    quote: "এডুসব-এর নির্ভুল CGPA ক্যালকুলেটর ও বিগত বছরের প্রশ্নব্যাংক আমার সেমিস্টার পরীক্ষার প্রস্তুতিতে দারুণ ভূমিকা রেখেছে। সম্পূর্ণ ফ্রি প্ল্যাটফর্ম হিসেবে এটি অতুলনীয়।",
  },
  {
    name: "মাহির ফয়সাল",
    identity: "গ্র্যাজুয়েট ও চাকরিপ্রার্থী",
    service: "১ ও ৩ পেজ সিভি মেকার",
    quote: "এডুসব সিভি মেকার দিয়ে মনোগ্রাম হেডারসহ প্রফেশনাল রেজুমে তৈরি করেছি। ফরম্যাটটি এতই স্ট্যান্ডার্ড যে প্রথম ইন্টারভিউতেই সিলেক্ট হয়েছি।",
  },
];

export const Testimonials = () => {
  return (
    <section id="reviews" className="border-b border-white/5 bg-[#0d1017] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 text-center max-w-2xl mx-auto"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            শিক্ষার্থীদের অভিজ্ঞতা
          </span>
          <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            দেশজুড়ে শিক্ষার্থীদের আস্থা ও মতামত
          </h2>
          <p className="font-bangla mt-2 text-sm text-slate-400">
            বোর্ড রেজাল্ট দেখা থেকে শুরু করে পরীক্ষার প্রস্তুতি—এডুসব প্রতিদিন লাখো শিক্ষার্থীর সঙ্গী।
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121620] p-6 lg:p-8"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="rounded bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                    {r.service}
                  </span>
                </div>
                <blockquote className="font-bangla text-xs sm:text-sm leading-relaxed text-slate-300">
                  "{r.quote}"
                </blockquote>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 flex items-center gap-2 font-bangla">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">{r.name}</h4>
                  <p className="text-[11px] text-slate-500">{r.identity}</p>
                </div>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
