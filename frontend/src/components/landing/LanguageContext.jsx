import { createContext, useContext, useEffect, useState } from "react";

const STR = {
  bn: {
    navCourses: "কোর্সসমূহ",
    navMethod: "আমাদের পদ্ধতি",
    navMentors: "মেন্টরবৃন্দ",
    navReviews: "রিভিউ",
    navFaq: "FAQ",
    navEnroll: "কোর্সে ভর্তি হোন",
    heroBadge: "৪৫,০০০+ শিক্ষার্থী ইতিমধ্যে যুক্ত",
    heroLine1: "দেশসেরা মেন্টরদের সাথে শিখুন,",
    heroLine2: "গড়ুন আপনার",
    heroLine3: "ভবিষ্যতের ক্যারিয়ার",
    heroSub: "বাংলায় সহজ ও প্র্যাকটিক্যাল উপায়ে ফুলস্ট্যাক ওয়েব, এআই, ইউআই/ইউএক্স এবং ডিজিটাল স্কিল শিখুন EduSob-এ।",
    ctaBrowse: "ব্রাউজ কোর্স",
    ctaDemo: "ফ্রি ডেমো ক্লাস",
    heroTrust: "আমাদের গ্র্যাজুয়েটরা কাজ করছেন",
    manifestoKicker: "আমাদের পদ্ধতি",
    manifestoTitle: "চারটি অধ্যায়ে ক্যারিয়ার ট্রান্সফরমেশন",
    catalogKicker: "কোর্স ক্যাটালগ",
    catalogTitle: "আপনার জন্য সঠিক কোর্সটি বেছে নিন",
    statsKicker: "আমাদের প্রভাব",
    mentorsKicker: "মেন্টরবৃন্দ",
    mentorsTitle: "যাঁরা শেখাবেন, তাঁরা ইন্ডাস্ট্রিতেই কাজ করেন",
    reviewsKicker: "সাফল্যের গল্প",
    reviewsTitle: "শিক্ষার্থীদের জীবন বদলে যাওয়ার গল্প",
    faqKicker: "সাধারণ প্রশ্ন",
    faqTitle: "যা জানতে চান, সব উত্তর এখানে",
    enrollKicker: "ভর্তি চলছে",
    enrollTitle: "আজই আপনার আসনটি বুক করুন",
    footerTag: "শিক্ষা সবার জন্য",
  },
  en: {
    navCourses: "Courses",
    navMethod: "Our Method",
    navMentors: "Mentors",
    navReviews: "Reviews",
    navFaq: "FAQ",
    navEnroll: "Enroll Now",
    heroBadge: "45,000+ learners already joined",
    heroLine1: "Learn from the country's best mentors,",
    heroLine2: "build your",
    heroLine3: "future career",
    heroSub: "Master full-stack web, AI, UI/UX and digital skills in simple, practical Bengali — only on EduSob.",
    ctaBrowse: "Browse Courses",
    ctaDemo: "Free Demo Class",
    heroTrust: "Our graduates work at",
    manifestoKicker: "Our Method",
    manifestoTitle: "Career transformation in four chapters",
    catalogKicker: "Course Catalog",
    catalogTitle: "Pick the right course for you",
    statsKicker: "Our Impact",
    mentorsKicker: "Mentors",
    mentorsTitle: "Your teachers work in the industry right now",
    reviewsKicker: "Success Stories",
    reviewsTitle: "Life-changing stories from our learners",
    faqKicker: "FAQ",
    faqTitle: "Everything you want to know",
    enrollKicker: "Admission Open",
    enrollTitle: "Book your seat today",
    footerTag: "Education For Everyone",
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
