import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useLang } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const STATS = [
  { value: 45000, suffix: "+", label: "শিক্ষার্থী ভর্তি হয়েছেন" },
  { value: 94, suffix: "%", label: "প্লেসমেন্ট সফলতার হার" },
  { value: 120, suffix: "+", label: "ইন্ডাস্ট্রি মেন্টর" },
  { value: 500, suffix: "+", label: "হায়ারিং পার্টনার কোম্পানি" },
];

const Counter = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-extrabold text-white sm:text-5xl">
      {display.toLocaleString("en-US")}
      <span className="text-orange-500">{suffix}</span>
    </span>
  );
};

export const Stats = () => {
  const { t } = useLang();
  return (
    <section id="stats" className="border-y border-white/5 bg-[#0d1017] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <p className="font-mono-code mb-12 text-xs uppercase tracking-[0.25em] text-amber-400/90" data-testid="stats-kicker">
          {t("statsKicker")}
        </p>
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              data-testid={`stat-item-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
            >
              <Counter value={s.value} suffix={s.suffix} />
              <p className="font-bangla mt-3 text-sm text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
