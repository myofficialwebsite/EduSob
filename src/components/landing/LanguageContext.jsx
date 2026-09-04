import { createContext, useContext, useEffect, useState } from "react";

const STR = {
  bn: {
    navServices: "সেবাসমূহ",
    navSteps: "কার্যপদ্ধতি",
    navGuide: "নিবন্ধন নির্দেশিকা",
    navFaq: "সাধারণ জিজ্ঞাসা",
    navContact: "যোগাযোগ",
    navEnroll: "ফ্রি রেজিস্ট্রেশন",
    heroBadge: "বাংলাদেশের শিক্ষার্থীদের একক ডিজিটাল শিক্ষা প্ল্যাটফর্ম",
    heroLine1: "পরীক্ষার প্রস্তুতি থেকে ক্যারিয়ার—",
    heroLine2: "সবকিছু",
    heroLine3: "এক ঠিকানায়",
    heroSub: "বোর্ড পরীক্ষার দ্রুত ফলাফল, কলেজ ও বিশ্ববিদ্যালয়ের ভর্তি তথ্য, ১-অন-১ শিক্ষক সহায়তা, ৫০,০০০+ প্রশ্নব্যাংক ও প্রফেশনাল সিভি মেকার—সব এক সমন্বিত সিস্টেমে।",
    ctaSignup: "ফ্রি রেজিস্ট্রেশন করুন",
    ctaResults: "রেজাল্ট চেক",
    ctaTeacher: "শিক্ষক সহায়তা",
    heroAudience: "৯ থেকে ৩০ বছর বয়সী স্কুল, কলেজ, মাদ্রাসা, বিশ্ববিদ্যালয় শিক্ষার্থী ও চাকরিপ্রার্থীদের জন্য উন্মুক্ত",
    servicesKicker: "আমাদের সেবাসমূহ",
    servicesTitle: "শিক্ষার্থী ও চাকরিপ্রার্থীদের সম্পূর্ণ সমাধান",
    servicesSub: "প্রয়োজনীয় প্রতিটি টুলস ও ফিচার সাজানো হয়েছে এক ক্লিকে ব্যবহারের জন্য",
    stepsKicker: "সহজ পদ্ধতি",
    stepsTitle: "এডুসব-এ অংশগ্রহণের ৬টি সহজ ধাপ",
    stepsSub: "এক ক্লিকে রেজিস্ট্রেশন থেকে ক্যারিয়ার প্রস্তুতি—পর্যায়ক্রমিক সমাধান",
    guideKicker: "সহায়তা গাইড",
    guideTitle: "নিবন্ধন করার সম্পূর্ণ নির্দেশিকা",
    guideSub: "সহজ ৪টি পদক্ষেপে আপনার এডুসব প্রোফাইল সেটআপ করুন",
    faqKicker: "সাধারণ জিজ্ঞাসা",
    faqTitle: "এডুসব সম্পর্কে সাধারণ প্রশ্নোত্তর",
    faqSub: "আপনার প্রয়োজনীয় সব প্রশ্নের উত্তর এক সাথে",
    registerKicker: "যুক্ত হোন",
    registerTitle: "এডুসব-এ আজই আপনার ফ্রি প্রোফাইল তৈরি করুন",
    registerSub: "সকল এডুকেশন টুলস, রেজাল্ট এলার্ট ও প্রশ্নব্যাংক ফ্রি অ্যাক্সেস করতে ফর্মটি পূরণ করুন",
    footerTag: "শিক্ষার সব, এক ঠিকানায় — এডুসব | EduSob",
  },
  en: {
    navServices: "Services",
    navSteps: "How it Works",
    navGuide: "Guide",
    navFaq: "FAQ",
    navContact: "Contact",
    navEnroll: "Free Register",
    heroBadge: "Bangladesh's Unified Digital Education Platform",
    heroLine1: "From Exam Prep to Career—",
    heroLine2: "Everything in",
    heroLine3: "One Place",
    heroSub: "Instant board exam results, university admission hub, 1-on-1 teacher guidance, 50,000+ question bank, and pro CV builder—all in one unified system.",
    ctaSignup: "Free Registration",
    ctaResults: "Check Results",
    ctaTeacher: "Teacher Support",
    heroAudience: "Open for students and job seekers aged 9 to 30 years across Bangladesh",
    servicesKicker: "Our Services",
    servicesTitle: "Complete Solutions for Students & Job Seekers",
    servicesSub: "Every essential tool and feature arranged for 1-click access",
    stepsKicker: "Easy Process",
    stepsTitle: "6 Simple Steps to Get Started on EduSob",
    stepsSub: "From registration to exam and career success",
    guideKicker: "Help Guide",
    guideTitle: "Complete Registration Guidelines",
    guideSub: "Setup your EduSob profile in 4 easy steps",
    faqKicker: "FAQ",
    faqTitle: "Frequently Asked Questions",
    faqSub: "Get answers to all your common queries about EduSob",
    registerKicker: "Join Today",
    registerTitle: "Create Your Free Profile on EduSob",
    registerSub: "Fill out the form to get free access to all education tools & question banks",
    footerTag: "Everything in Education, Under One Roof — EduSob",
  },
};

const LangContext = createContext();

const LANG_KEY = "edusob_lang";

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "bn" || saved === "en") return saved;
    } catch {
      /* localStorage unavailable */
    }
    return "bn";
  });

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* localStorage unavailable */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => STR[lang][key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -72 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
