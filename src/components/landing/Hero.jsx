import { useRef } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { Flame, Play, ArrowRight } from "lucide-react";
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

const TiltCard = () => {
  const ref = useRef(null);
  const rectRef = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });

  const onEnter = () => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  };

  const onMove = (e) => {
    if (!rectRef.current && ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };

  const onLeave = () => {
    rectRef.current = null;
    rx.set(0);
    ry.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={ref}
        data-testid="hero-3d-card"
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.7, ease: EASE }}
        className="relative rounded-2xl border border-white/10 bg-[#121620]/90 p-1.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] will-change-transform"
      >
        <div className="rounded-xl border border-white/5 bg-[#0b0d12] p-5" style={{ transform: "translateZ(30px)" }}>
          <div className="mb-4 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="font-mono-code ml-3 text-[10px] tracking-wider text-slate-500">live-class.jsx — ব্যাচ ১২</span>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> LIVE
            </span>
          </div>
          <pre className="font-mono-code text-[11px] leading-relaxed sm:text-xs">
            <code>
              <span className="text-cyan-400">const</span> <span className="text-amber-300">student</span> <span className="text-slate-500">=</span> <span className="text-slate-300">{"{"}</span>{"\n"}
              {"  "}name: <span className="text-emerald-400">'আপনি'</span>,{"\n"}
              {"  "}goal: <span className="text-emerald-400">'Software Engineer'</span>,{"\n"}
              {"  "}mentor: <span className="text-emerald-400">'1:1 লাইভ সাপোর্ট'</span>,{"\n"}
              <span className="text-slate-300">{"}"}</span>;{"\n\n"}
              <span className="text-cyan-400">await</span> <span className="text-amber-300">EduSob</span>.<span className="text-orange-400">transform</span>(student);{"\n"}
              <span className="text-slate-500">{"// → ক্যারিয়ার শুরু ✓"}</span>
            </code>
          </pre>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
        className="font-bangla absolute -bottom-5 -left-4 rounded-xl border border-white/10 bg-[#1a202c]/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-8"
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-500">প্লেসমেন্ট রেট</p>
        <p className="font-display text-2xl font-bold text-emerald-400">৯৪%</p>
      </motion.div>
    </div>
  );
};

export const Hero = () => {
  const { t } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <section id="hero" ref={ref} className="relative overflow-hidden pb-24 pt-36 lg:pb-32 lg:pt-44">
      <motion.div style={{ y: glowY }} className="hero-glow pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="font-bangla mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300"
            data-testid="hero-badge"
          >
            <Flame className="h-3.5 w-3.5" />
            {t("heroBadge")}
          </motion.div>

          <h1 className="font-bangla text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl" data-testid="hero-title">
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
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            className="font-bangla mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
            data-testid="hero-subtitle"
          >
            {t("heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              data-testid="hero-cta-browse"
              onClick={() => scrollToId("courses")}
              className="group font-bangla flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(249,115,22,0.4)] transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_36px_rgba(249,115,22,0.6)]"
            >
              {t("ctaBrowse")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              data-testid="hero-cta-demo"
              onClick={() => scrollToId("enroll")}
              className="group font-bangla flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-cyan-400/50 hover:text-cyan-300"
            >
              <Play className="h-4 w-4" />
              {t("ctaDemo")}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-12"
          >
            <p className="font-bangla mb-3 text-xs uppercase tracking-widest text-slate-500">{t("heroTrust")}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-slate-500">
              <span className="transition-colors duration-300 hover:text-slate-300">bKash</span>
              <span className="transition-colors duration-300 hover:text-slate-300">Pathao</span>
              <span className="transition-colors duration-300 hover:text-slate-300">Brain Station 23</span>
              <span className="transition-colors duration-300 hover:text-slate-300">Optimizely</span>
              <span className="transition-colors duration-300 hover:text-slate-300">ShopUp</span>
            </div>
          </motion.div>
        </div>

        <TiltCard />
      </div>
    </section>
  );
};
