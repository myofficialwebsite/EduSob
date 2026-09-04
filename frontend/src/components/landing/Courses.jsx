import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, Users, X, CheckCircle2 } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";
import { API } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORIES = [
  { id: "all", label: "সব কোর্স" },
  { id: "web", label: "ওয়েব ডেভেলপমেন্ট" },
  { id: "ai", label: "AI & Data" },
  { id: "design", label: "UI/UX ডিজাইন" },
  { id: "marketing", label: "ডিজিটাল মার্কেটিং" },
  { id: "hsc", label: "HSC ও এডমিশন" },
];

const fmt = (n) => `৳${n.toLocaleString("en-US")}`;

const CourseModal = ({ course, onClose, onEnroll }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    onClick={onClose}
    data-testid="course-modal"
  >
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={(e) => e.stopPropagation()}
      className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#121620] p-6 lg:p-8"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="font-mono-code rounded-full bg-orange-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-orange-400">
            {course.batch} • {course.level}
          </span>
          <h3 className="font-bangla mt-3 text-xl font-bold text-white sm:text-2xl">{course.title}</h3>
          <p className="font-bangla mt-1 text-sm text-slate-400">
            {course.mentor} — <span className="text-slate-500">{course.mentor_role}</span>
          </p>
        </div>
        <button data-testid="course-modal-close" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="font-mono-code mb-3 text-[11px] uppercase tracking-widest text-slate-500">সিলেবাস</p>
      <ul className="mb-6 space-y-2.5">
        {course.syllabus.map((s, i) => (
          <li key={i} className="font-bangla flex items-start gap-2.5 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            {s}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-white/10 pt-5">
        <div>
          <span className="font-display text-2xl font-bold text-white">{fmt(course.price)}</span>
          <span className="ml-2 text-sm text-slate-500 line-through">{fmt(course.old_price)}</span>
        </div>
        <button
          data-testid="course-modal-enroll"
          onClick={() => onEnroll(course.id)}
          className="font-bangla rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          সিট বুক করুন
        </button>
      </div>
    </motion.div>
  </motion.div>
  );
};

export const Courses = ({ onEnroll }) => {
  const { t } = useLang();
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let ignore = false;
    axios
      .get(`${API}/courses`, { params: { category, q: query || undefined } })
      .then((res) => {
        if (!ignore) setCourses(res.data);
      })
      .catch(() => {
        if (!ignore) setCourses([]);
      });
    return () => {
      ignore = true;
    };
  }, [category, query]);

  const counts = useMemo(() => courses.length, [courses]);

  return (
    <section id="courses" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-12"
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90">{t("catalogKicker")}</p>
          <h2 className="font-bangla max-w-xl text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="catalog-title">
            {t("catalogTitle")}
          </h2>
        </motion.div>

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                data-testid={`course-category-tab-${c.id}`}
                onClick={() => setCategory(c.id)}
                className={`font-bangla rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                  category === c.id
                    ? "bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.4)]"
                    : "border border-white/10 text-slate-400 hover:border-orange-500/40 hover:text-orange-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              data-testid="course-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="কোর্স খুঁজুন..."
              className="font-bangla w-full rounded-full border border-white/10 bg-[#121620] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none lg:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {courses.map((c, i) => (
              <motion.div
                key={c.id}
                data-testid={`course-card-${c.id}`}
                layout
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                whileHover={{ y: -6 }}
                onClick={() => setSelected(c)}
                className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#121620] p-6 transition-colors duration-500 hover:border-orange-500/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono-code rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-wider text-cyan-300">
                    {c.batch}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {c.rating}
                  </span>
                </div>
                <h3 className="font-bangla mb-2 text-lg font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-orange-300">
                  {c.title}
                </h3>
                <p className="font-bangla mb-5 text-xs text-slate-500">
                  {c.mentor} • {c.mentor_role}
                </p>
                <div className="mb-5 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {c.duration_weeks} সপ্তাহ
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {c.enrolled.toLocaleString()} জন
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div>
                    <span className="font-display text-xl font-bold text-white">{fmt(c.price)}</span>
                    <span className="ml-2 text-xs text-slate-500 line-through">{fmt(c.old_price)}</span>
                  </div>
                  <span className="font-bangla text-xs font-semibold text-orange-400 transition-transform duration-300 group-hover:translate-x-1">
                    সিট বুক করুন →
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {counts === 0 && (
          <p className="font-bangla py-16 text-center text-slate-500" data-testid="course-empty-state">
            কোনো কোর্স পাওয়া যায়নি — অন্য কিছু খুঁজে দেখুন।
          </p>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <CourseModal
            course={selected}
            onClose={() => setSelected(null)}
            onEnroll={(id) => {
              setSelected(null);
              onEnroll(id);
              scrollToId("enroll");
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
