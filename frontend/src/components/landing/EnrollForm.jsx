import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangle, Tag } from "lucide-react";
import { useLang } from "./LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EASE = [0.16, 1, 0.3, 1];
const PHONE_RE = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const EnrollForm = ({ preselectedCourse }) => {
  const { t } = useLang();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", course_id: "", coupon: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/courses`).then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedCourse) setForm((f) => ({ ...f, course_id: preselectedCourse }));
  }, [preselectedCourse]);

  const course = courses.find((c) => c.id === form.course_id);
  const couponValid = form.coupon.trim().toUpperCase() === "EDUSOB2026";
  const finalPrice = useMemo(() => {
    if (!course) return null;
    return couponValid ? Math.round(course.price * 0.85) : course.price;
  }, [course, couponValid]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("আপনার নাম লিখুন");
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, "")))
      return toast.error("সঠিক মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)");
    if (!form.course_id) return toast.error("একটি কোর্স নির্বাচন করুন");

    setLoading(true);
    try {
      const res = await axios.post(`${API}/enroll`, {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        course_id: form.course_id,
        coupon: form.coupon || undefined,
      });
      toast.success(
        `ভর্তি নিশ্চিত হয়েছে, ${res.data.name}! ${res.data.course_title} — মূল্য ৳${res.data.price_paid.toLocaleString()}${
          res.data.discount_percent ? ` (${res.data.discount_percent}% ছাড়)` : ""
        }। আমাদের টিম শীঘ্রই কল করবে।`,
        { duration: 6000 }
      );
      setForm({ name: "", phone: "", email: "", course_id: "", coupon: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "কিছু ভুল হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "font-bangla w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none transition-colors duration-300";

  return (
    <section id="enroll" className="relative overflow-hidden py-20 lg:py-32">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-2 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90">{t("enrollKicker")}</p>
          <h2 className="font-bangla text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="enroll-title">
            {t("enrollTitle")}
          </h2>
          <p className="font-bangla mt-5 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            ফর্মটি পূরণ করলেই আমাদের ভর্তি টিম ২৪ ঘণ্টার মধ্যে আপনাকে কল করবে। কোনো অগ্রিম পেমেন্ট লাগবে না।
          </p>
          <div className="font-bangla mt-8 inline-flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300" data-testid="enroll-seat-urgency">
            <AlertTriangle className="h-4 w-4" />
            পরবর্তী ব্যাচে আর মাত্র ৭টি সিট বাকি!
          </div>
          <div className="font-bangla mt-5 flex items-center gap-2 text-sm text-slate-400">
            <Tag className="h-4 w-4 text-orange-400" />
            কুপন <span className="font-mono-code rounded bg-white/5 px-2 py-0.5 text-orange-300">EDUSOB2026</span> ব্যবহার করে পান ১৫% ছাড়
          </div>
        </motion.div>

        <motion.form
          data-testid="enroll-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="rounded-2xl border border-white/10 bg-[#121620]/90 p-6 backdrop-blur lg:p-8"
        >
          <div className="space-y-4">
            <input data-testid="enroll-name-input" value={form.name} onChange={set("name")} placeholder="আপনার নাম *" className={inputCls} />
            <input data-testid="enroll-phone-input" value={form.phone} onChange={set("phone")} placeholder="মোবাইল নম্বর (017XXXXXXXX) *" className={inputCls} />
            <input data-testid="enroll-email-input" type="email" value={form.email} onChange={set("email")} placeholder="ইমেইল (ঐচ্ছিক)" className={inputCls} />
            <select
              data-testid="enroll-course-select"
              value={form.course_id}
              onChange={set("course_id")}
              className={`${inputCls} appearance-none ${form.course_id ? "" : "text-slate-500"}`}
            >
              <option value="" disabled>কোর্স নির্বাচন করুন *</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121620] text-white">
                  {c.title} — ৳{c.price.toLocaleString()}
                </option>
              ))}
            </select>
            <input data-testid="enroll-coupon-input" value={form.coupon} onChange={set("coupon")} placeholder="কুপন কোড (ঐচ্ছিক)" className={inputCls} />

            {finalPrice !== null && (
              <div className="font-bangla flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0b0d12] px-4 py-3 text-sm" data-testid="enroll-price-preview">
                <span className="text-slate-400">প্রদেয় মূল্য</span>
                <span className="font-display text-lg font-bold text-white">
                  ৳{finalPrice.toLocaleString()}
                  {couponValid && <span className="ml-2 text-xs font-medium text-emerald-400">১৫% ছাড় প্রযোজ্য</span>}
                </span>
              </div>
            )}

            <button
              data-testid="enroll-form-submit"
              type="submit"
              disabled={loading}
              className="font-bangla w-full rounded-full bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(249,115,22,0.35)] transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_36px_rgba(249,115,22,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "জমা হচ্ছে..." : "ভর্তি নিশ্চিত করুন"}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};
