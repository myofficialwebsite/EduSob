import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { useLang } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const REVIEWS = [
  {
    name: "রাকিব হোসেন",
    journey: "নন-সিএসই ব্যাকগ্রাউন্ড → Software Engineer",
    company: "bKash",
    quote: "কমার্সের ছাত্র হয়ে কোডিং শেখা অসম্ভব মনে হতো। EduSob-এর মেন্টররা প্রতিটি রাতে আমার ডাউট ক্লিয়ার করেছেন। ৮ মাসে bKash-এ চাকরি!",
  },
  {
    name: "সুমাইয়া আক্তার",
    journey: "HSC পাশ → UI/UX Designer",
    company: "ShopUp",
    quote: "ডিজাইন মাস্টারক্লাসের পোর্টফোলিও প্রজেক্টগুলোই আমার ইন্টারভিউতে গেম চেঞ্জার ছিল। বাংলায় এত মানসম্মত কনটেন্ট অন্য কোথাও পাইনি।",
  },
  {
    name: "ফারহান চৌধুরী",
    journey: "চাকরিজীবী → Remote Developer (US)",
    company: "Remote US Company",
    quote: "১:১ কোড রিভিউ সেশনগুলো আমার কোডিং স্ট্যান্ডার্ড একদম বদলে দিয়েছে। এখন ঘরে বসে আমেরিকান কোম্পানিতে রিমোট জব করি।",
  },
];

export const Testimonials = () => {
  const { t } = useLang();
  return (
    <section id="reviews" className="border-y border-white/5 bg-[#0d1017] py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-14 max-w-2xl"
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90">{t("reviewsKicker")}</p>
          <h2 className="font-bangla text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="reviews-title">
            {t("reviewsTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              data-testid={`testimonial-card-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#121620] p-6 transition-colors duration-500 hover:border-orange-500/40 lg:p-8"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="font-bangla flex-1 text-sm leading-relaxed text-slate-300">
                "{r.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bangla flex items-center gap-1.5 font-semibold text-white">
                      {r.name}
                      <BadgeCheck className="h-4 w-4 text-cyan-400" />
                    </p>
                    <p className="font-bangla mt-1 text-xs text-slate-500">{r.journey}</p>
                  </div>
                  <span className="font-display rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                    {r.company}
                  </span>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
