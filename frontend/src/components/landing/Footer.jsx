import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Facebook, Youtube, Linkedin, MessageSquare, Heart } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Footer = () => {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter`, { email });
      toast.success("সাবস্ক্রিপশন সফল! নতুন কোর্সের খবর সবার আগে পাবেন।");
      setEmail("");
    } catch {
      toast.error("সঠিক ইমেইল দিন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-white/5 bg-[#090b0f] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid gap-12 pb-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-bangla mb-3 text-sm text-slate-400">{t("footerTag")} • Education For Everyone</p>
            <p className="font-bangla mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
              নতুন কোর্স, ফ্রি ওয়ার্কশপ ও ক্যারিয়ার টিপস সবার আগে পেতে সাবস্ক্রাইব করুন।
            </p>
            <form onSubmit={subscribe} className="flex max-w-sm gap-2" data-testid="newsletter-form">
              <input
                data-testid="newsletter-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল"
                className="font-bangla flex-1 rounded-full border border-white/10 bg-[#121620] px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
              />
              <button
                data-testid="newsletter-submit-button"
                type="submit"
                disabled={loading}
                className="font-bangla rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                যুক্ত হোন
              </button>
            </form>
            <div className="mt-8 flex gap-3">
              {[
                { icon: Facebook, id: "facebook" },
                { icon: Youtube, id: "youtube" },
                { icon: Linkedin, id: "linkedin" },
                { icon: MessageSquare, id: "discord" },
              ].map((s) => (
                <button
                  key={s.id}
                  data-testid={`footer-social-${s.id}`}
                  className="rounded-full border border-white/10 p-2.5 text-slate-400 transition-all duration-300 hover:border-orange-500/50 hover:text-orange-400"
                  aria-label={s.id}
                >
                  <s.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono-code mb-5 text-[11px] uppercase tracking-widest text-slate-500">প্ল্যাটফর্ম</p>
            <ul className="font-bangla space-y-3 text-sm text-slate-400">
              {[
                { label: "কোর্সসমূহ", id: "courses" },
                { label: "আমাদের পদ্ধতি", id: "manifesto" },
                { label: "মেন্টরবৃন্দ", id: "mentors" },
                { label: "ভর্তি", id: "enroll" },
              ].map((l) => (
                <li key={l.id}>
                  <button
                    data-testid={`footer-link-${l.id}`}
                    onClick={() => scrollToId(l.id)}
                    className="transition-colors duration-300 hover:text-orange-400"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="font-mono-code mb-5 text-[11px] uppercase tracking-widest text-slate-500">পলিসি</p>
            <ul className="font-bangla space-y-3 text-sm text-slate-400">
              <li><span className="cursor-pointer transition-colors hover:text-orange-400" data-testid="footer-link-terms">শর্তাবলী</span></li>
              <li><span className="cursor-pointer transition-colors hover:text-orange-400" data-testid="footer-link-privacy">প্রাইভেসি পলিসি</span></li>
              <li><span className="cursor-pointer transition-colors hover:text-orange-400" data-testid="footer-link-refund">রিফান্ড পলিসি</span></li>
            </ul>
          </div>
        </div>

        <div className="select-none overflow-hidden border-t border-white/5 py-8">
          <p className="font-display text-center text-[18vw] font-extrabold leading-none tracking-tight text-white/[0.04] lg:text-[11rem]" data-testid="footer-brand-mark">
            EDUSOB
          </p>
        </div>

        <div className="font-bangla flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© ২০২৬ EduSob — সর্বস্বত্ব সংরক্ষিত</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for Learners in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
};
