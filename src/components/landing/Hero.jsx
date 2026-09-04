import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, GraduationCap, Users, BookOpen, CheckCircle, ShieldCheck } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const MaskedLine = ({ children, delay, className }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

const EduSobInteractivePreview = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "স্মার্ট শিক্ষার্থী প্রস্তুতি প্ল্যাটফর্ম",
      tag: "এডুসব লার্নিং হাব ২০২৬",
      badge: "🎓 অল-ইন-ওয়ান এডুকেশন",
      desc: "বোর্ড পরীক্ষার ফলাফল, সিলেবাস, প্রশ্নব্যাংক ও স্কলারশিপ এক ছাতার নিচে",
      metric: "৫ লক্ষ+ শিক্ষার্থী ট্রাস্টেড",
      color: "from-orange-500/20 via-[#121620] to-[#090b0f]",
      border: "border-orange-500/30",
      accent: "text-orange-400"
    },
    {
      title: "স্মার্ট MCQ প্র্যাকটিস ও এনালাইসিস",
      tag: "লাইভ মডেল টেস্ট",
      badge: "⚡ স্পেসড রিপিটেশন",
      desc: "ভুল প্রশ্নের স্বয়ংক্রিয় রিভিশন শিডিউল ও বোর্ডভিত্তিক প্রশ্নব্যাংক",
      metric: "৫০,০০০+ যাচাইকৃত প্রশ্ন",
      color: "from-teal-500/20 via-[#121620] to-[#090b0f]",
      border: "border-teal-500/30",
      accent: "text-teal-400"
    },
    {
      title: "রেজাল্ট হাব ও ১-অন-১ শিক্ষক সহায়তা",
      tag: "দ্রুততম ব্যাকআপ সার্ভার",
      badge: "👨‍🏫 তাৎক্ষণিক সমাধান",
      desc: "SSC, HSC ও জাতীয় বিশ্ববিদ্যালয়ের রেজাল্ট এবং অভিজ্ঞ শিক্ষকদের সহায়তা",
      metric: "১০০% নির্ভুল মার্কশিট",
      color: "from-amber-500/20 via-[#121620] to-[#090b0f]",
      border: "border-amber-500/30",
      accent: "text-amber-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide];

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
        className="relative rounded-3xl border border-white/10 bg-[#121620] p-4 sm:p-6 shadow-2xl"
      >
        <div className={`relative rounded-2xl border ${slide.border} bg-gradient-to-br ${slide.color} p-6 sm:p-8 min-h-[360px] flex flex-col justify-between transition-all duration-700`}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
              <Sparkles className={`h-3.5 w-3.5 ${slide.accent}`} />
              {slide.tag}
            </span>
            <span className="text-xs font-semibold text-slate-400">{slide.badge}</span>
          </div>

          <div className="my-auto py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl shadow-inner">
              {activeSlide === 0 ? "🎓" : activeSlide === 1 ? "📝" : "👨‍🏫"}
            </div>
            <h3 className="font-bangla text-xl sm:text-2xl font-bold text-white leading-snug">
              {slide.title}
            </h3>
            <p className="font-bangla mt-2 max-w-sm mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
              {slide.desc}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>১০০% ফ্রি ও নিরাপদ</span>
            </div>
            <span className={`font-bold ${slide.accent}`}>{slide.metric}</span>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? "w-8 bg-orange-500" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Trust Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: EASE }}
        className="absolute -bottom-5 -left-4 rounded-2xl border border-white/15 bg-[#0b0d12]/95 px-4 py-3 shadow-2xl backdrop-blur sm:-left-6 flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">নিবন্ধিত শিক্ষার্থী</p>
          <p className="font-bangla text-lg font-bold text-white">১,৫০,০০০+</p>
        </div>
      </motion.div>
    </div>
  );
};

export const Hero = () => {
  const { t } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  return (
    <section id="hero" ref={ref} className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40 bg-[#0b0d12]">
      <motion.div style={{ y: glowY }} className="hero-glow pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="font-bangla mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300"
          >
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            {t("heroBadge")}
          </motion.div>

          <h1 className="font-bangla text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] tracking-tight text-white">
            <MaskedLine delay={0.25}>{t("heroLine1")}</MaskedLine>
            <MaskedLine delay={0.4}>
              {t("heroLine2")}{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                {t("heroLine3")}
              </span>
            </MaskedLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="font-bangla mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300"
          >
            {t("heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
            className="mt-4 flex items-center gap-2 text-xs text-slate-400"
          >
            <CheckCircle className="h-4 w-4 text-orange-400 shrink-0" />
            <span>{t("heroAudience")}</span>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => scrollToId("enroll")}
              className="group font-bangla flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(249,115,22,0.4)] transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_36px_rgba(249,115,22,0.6)]"
            >
              <span>{t("ctaSignup")}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => scrollToId("services")}
              className="group font-bangla flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-orange-500/50 hover:text-orange-300"
            >
              <GraduationCap className="h-4 w-4 text-orange-400" />
              <span>{t("ctaResults")}</span>
            </button>

            <button
              onClick={() => scrollToId("services")}
              className="group font-bangla flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition-all duration-300 hover:bg-amber-400/20"
            >
              <span>👨‍🏫 {t("ctaTeacher")}</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black text-amber-200">NEW</span>
            </button>
          </motion.div>

          {/* Key Metrics Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-10 rounded-2xl border border-white/10 bg-[#121620] p-4 flex flex-wrap sm:flex-nowrap items-center divide-y sm:divide-y-0 sm:divide-x divide-white/10"
          >
            <div className="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
              <p className="font-bangla text-2xl font-bold text-white">১,৫০,০০০<span className="text-orange-400">+</span></p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">নিবন্ধিত শিক্ষার্থী</p>
            </div>
            <div className="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
              <p className="font-bangla text-2xl font-bold text-white">৫০,০০০<span className="text-orange-400">+</span></p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">প্রশ্নব্যাংক ও রিসোর্স</p>
            </div>
            <div className="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
              <p className="font-bangla text-2xl font-bold text-orange-400">১০০% ফ্রি</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">নিরাপদ ও নির্ভরযোগ্য</p>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <EduSobInteractivePreview />
        </div>
      </div>
    </section>
  );
};
