import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, Send, ShieldCheck, UserCheck } from "lucide-react";
import { useLang } from "./LanguageContext";
import { EDUSOB_SERVICES } from "../../data/edusob";

const EASE = [0.16, 1, 0.3, 1];
const PHONE_RE = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const EnrollForm = () => {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    education_level: "hsc",
    service_id: "results",
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("আপনার পুরো নাম লিখুন");
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, "")))
      return toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)");

    setLoading(true);
    // Simulate immediate API response
    setTimeout(() => {
      setLoading(false);
      setRegistered(true);
      toast.success(`অভিনন্দন, ${form.name}! আপনার এডুসব প্রোফাইল সক্রিয় হয়েছে।`, {
        description: "এখন আপনি বিনামূল্যে সকল এডুকেশন টুলস অ্যাক্সেস করতে পারবেন।"
      });
    }, 600);
  };

  return (
    <section id="enroll" className="relative bg-[#0b0d12] py-24 border-t border-white/5">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            {t("registerKicker")}
          </span>
          <h2 className="font-bangla mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {t("registerTitle")}
          </h2>
          <p className="font-bangla mt-2 max-w-xl mx-auto text-sm text-slate-400">
            {t("registerSub")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-3xl border border-white/10 bg-[#121620] p-6 sm:p-10 shadow-2xl"
        >
          {registered ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-bangla text-2xl font-bold text-white mb-2">
                রেজিস্ট্রেশন সফল হয়েছে!
              </h3>
              <p className="font-bangla text-sm text-slate-300 max-w-md mx-auto mb-6">
                স্বাগতম <strong>{form.name}</strong>। আপনার শিক্ষার্থী অ্যাকাউন্ট সক্রিয় করা হয়েছে।
              </p>
              <div className="rounded-2xl border border-white/10 bg-[#090b0f] p-4 max-w-md mx-auto mb-6 text-left font-bangla text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>মোবাইল নম্বর:</span>
                  <span className="text-white font-mono">{form.phone}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>নির্বাচিত সেবা:</span>
                  <span className="text-orange-400 font-bold">
                    {EDUSOB_SERVICES.find((s) => s.id === form.service_id)?.title || "সকল সেবা"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>অ্যাকাউন্ট স্ট্যাটাস:</span>
                  <span className="text-emerald-400 font-bold">সক্রিয় (১০০% ফ্রি)</span>
                </div>
              </div>
              <button
                onClick={() => setRegistered(false)}
                className="font-bangla rounded-full border border-white/15 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                আরেকটি প্রোফাইল তৈরি করুন
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="font-bangla block text-xs font-bold text-slate-300 mb-2">
                    আপনার পুরো নাম <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="যেমন: মোঃ তামিম ইকবাল"
                    className="font-bangla w-full rounded-2xl border border-white/10 bg-[#090b0f] px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bangla block text-xs font-bold text-slate-300 mb-2">
                    মোবাইল নম্বর <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="01XXXXXXXXX"
                    className="font-mono w-full rounded-2xl border border-white/10 bg-[#090b0f] px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="font-bangla block text-xs font-bold text-slate-300 mb-2">
                    বর্তমান শ্রেণি বা স্তর
                  </label>
                  <select
                    value={form.education_level}
                    onChange={set("education_level")}
                    className="font-bangla w-full rounded-2xl border border-white/10 bg-[#090b0f] px-4 py-3 text-xs sm:text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  >
                    <option value="ssc">মাধ্যমিক (SSC / দাখিল)</option>
                    <option value="hsc">উচ্চমাধ্যমিক (HSC / আলিম)</option>
                    <option value="nu">জাতীয় বিশ্ববিদ্যালয় (অনার্স / ডিগ্রি)</option>
                    <option value="university">পাবলিক / প্রাইভেট বিশ্ববিদ্যালয়</option>
                    <option value="jobseeker">চাকরিপ্রার্থী / অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="font-bangla block text-xs font-bold text-slate-300 mb-2">
                    কাঙ্ক্ষিত মূল সেবা
                  </label>
                  <select
                    value={form.service_id}
                    onChange={set("service_id")}
                    className="font-bangla w-full rounded-2xl border border-white/10 bg-[#090b0f] px-4 py-3 text-xs sm:text-sm text-white focus:border-orange-500/50 focus:outline-none"
                  >
                    {EDUSOB_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>আপনার তথ্য ১০০% সুরক্ষিত এবং তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-bangla w-full flex items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(249,115,22,0.4)] transition hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? (
                  <span>প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <span>ফ্রি প্রোফাইল খুলুন ও অ্যাক্সেস নিন</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
