import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap } from "lucide-react";
import { useLang, scrollToId } from "./LanguageContext";

const LINKS = [
  { id: "services", key: "navServices" },
  { id: "steps", key: "navSteps" },
  { id: "guide", key: "navGuide" },
  { id: "faq", key: "navFaq" },
];

export const Nav = () => {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          data-testid="nav-logo"
          onClick={() => go("hero")}
          className="flex items-center gap-2.5"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <GraduationCap className="h-5 w-5 text-orange-500" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.7)]" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            EduSob
            <span className="font-bangla ml-1.5 text-xs font-medium text-orange-400/90">এডুসব</span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-link-${l.id}`}
              onClick={() => go(l.id)}
              className="font-bangla text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-orange-400"
            >
              {t(l.key)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="nav-lang-toggle"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors duration-300 hover:border-orange-500/40 hover:text-orange-400"
          >
            {lang === "bn" ? "বাংলা" : "EN"}
          </button>
          <button
            data-testid="nav-enroll-button"
            onClick={() => go("enroll")}
            className="hidden rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.55)] sm:block"
          >
            {t("navEnroll")}
          </button>
          <button
            data-testid="nav-mobile-menu-button"
            onClick={() => setOpen(!open)}
            className="text-slate-300 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#0b0d12]/95 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  data-testid={`nav-mobile-link-${l.id}`}
                  onClick={() => go(l.id)}
                  className="font-bangla rounded-lg px-4 py-3 text-left text-slate-200 hover:bg-white/5"
                >
                  {t(l.key)}
                </button>
              ))}
              <button
                data-testid="nav-mobile-enroll-button"
                onClick={() => go("enroll")}
                className="font-bangla mt-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
              >
                {t("navEnroll")}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
