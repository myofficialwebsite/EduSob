import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MessageSquare, Send, Heart, ExternalLink } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";

export const Footer = () => {
  const { t } = useLang();
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("সাবস্ক্রিপশন সফল! এডুসব-এর নতুন আপডেট আপনার ইনবক্সে পৌঁছাবে।");
    setEmail("");
  };

  return (
    <footer id="contact" className="border-t border-white/5 bg-[#090b0f] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid gap-12 pb-16 lg:grid-cols-12">
          {/* Col 1: Brand & Newsletter */}
          <div className="lg:col-span-5">
            <h3 className="font-bangla text-xl font-bold text-white mb-2">
              EduSob <span className="text-orange-400">এডুসব</span>
            </h3>
            <p className="font-bangla mb-4 text-xs sm:text-sm text-slate-400">
              {t("footerTag")}
            </p>
            <p className="font-bangla mb-6 max-w-sm text-xs leading-relaxed text-slate-500">
              বোর্ড পরীক্ষার নোটিশ, রেজাল্ট এলার্ট ও ফ্রি মডেল টেস্টের আপডেট পেতে সাবস্ক্রাইব করে রাখুন।
            </p>

            <form onSubmit={subscribe} className="flex max-w-sm gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল ঠিকানা"
                className="font-bangla flex-1 rounded-full border border-white/10 bg-[#121620] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none"
              />
              <button
                type="submit"
                className="font-bangla rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-orange-600"
              >
                যুক্ত হোন
              </button>
            </form>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="lg:col-span-4">
            <p className="font-mono-code mb-4 text-[11px] uppercase tracking-widest text-slate-500">
              এডুসব সেবাসমূহ
            </p>
            <ul className="font-bangla grid grid-cols-2 gap-2 text-xs text-slate-400">
              {[
                { label: "রেজাল্ট হাব", id: "services" },
                { label: "১:১ শিক্ষক সহায়তা", id: "services" },
                { label: "সিভি মেকার", id: "services" },
                { label: "ভর্তি হাব", id: "services" },
                { label: "MCQ প্র্যাকটিস", id: "services" },
                { label: "প্রশ্নপত্র ব্যাংক", id: "services" },
                { label: "স্কলারশিপ হাব", id: "services" },
                { label: "CGPA ক্যালকুলেটর", id: "services" },
              ].map((l, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToId(l.id)}
                    className="hover:text-orange-400 transition"
                  >
                    • {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Real EduSob Support & Contact */}
          <div className="lg:col-span-3">
            <p className="font-mono-code mb-4 text-[11px] uppercase tracking-widest text-slate-500">
              তথ্য ও সহায়তা কেন্দ্র
            </p>
            <div className="space-y-3 text-xs text-slate-400 font-bangla">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <a href="tel:+8801835414122" className="hover:text-white transition font-mono">
                  +880 1835-414122
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href="mailto:support@edusob.com" className="hover:text-white transition">
                  support@edusob.com
                </a>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="https://chat.whatsapp.com/edusob-study-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#121620] px-3 py-1.5 text-[11px] text-emerald-400 hover:border-emerald-400/40 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp স্টাডি হাব</span>
                </a>

                <a
                  href="https://t.me/edusob_channel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#121620] px-3 py-1.5 text-[11px] text-sky-400 hover:border-sky-400/40 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>টেলিগ্রাম চ্যানেল</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Big Wordmark */}
        <div className="select-none overflow-hidden border-t border-white/5 py-8">
          <p className="font-display text-center text-[16vw] font-extrabold leading-none tracking-tight text-white/[0.04] lg:text-[10rem]">
            EDUSOB
          </p>
        </div>

        {/* Bottom bar */}
        <div className="font-bangla flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© ২০২৬ EduSob (এডুসব) — সর্বস্বত্ব সংরক্ষিত</p>
          <p className="flex items-center gap-1.5">
            বাংলাদেশের সকল শিক্ষার্থীদের জন্য নিবেদিত
          </p>
        </div>
      </div>
    </footer>
  );
};
