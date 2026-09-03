import { motion } from "framer-motion";
import { Linkedin, Globe } from "lucide-react";
import { useLang } from "./LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const MENTORS = [
  {
    name: "ড. নুসরাত জাহান",
    role: "AI Researcher, Ex-Google",
    img: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxzbWlsaW5nJTIwdGVhY2hlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NzQ3MzcyMw&ixlib=rb-4.1.0&q=85",
    exp: "১২+ বছরের অভিজ্ঞতা",
    students: "৩,২০০+ শিক্ষার্থী",
  },
  {
    name: "তানভীর হাসান",
    role: "Ex-Senior Engineer @ Pathao",
    img: "https://images.unsplash.com/photo-1758685848404-5b2bf607b38d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxzbWlsaW5nJTIwdGVhY2hlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NzQ3MzcyMw&ixlib=rb-4.1.0&q=85",
    exp: "১০+ বছরের অভিজ্ঞতা",
    students: "৫,৪০০+ শিক্ষার্থী",
  },
  {
    name: "মেহজাবিন রহমান",
    role: "Lead Product Designer @ Optimizely",
    img: "https://images.unsplash.com/photo-1590650213165-c1fef80648c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwdGVhY2hlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NzQ3MzcyMw&ixlib=rb-4.1.0&q=85",
    exp: "৯+ বছরের অভিজ্ঞতা",
    students: "২,৮০০+ শিক্ষার্থী",
  },
];

export const Mentors = () => {
  const { t } = useLang();
  return (
    <section id="mentors" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-14 max-w-2xl"
        >
          <p className="font-mono-code mb-4 text-xs uppercase tracking-[0.25em] text-amber-400/90">{t("mentorsKicker")}</p>
          <h2 className="font-bangla text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl" data-testid="mentors-title">
            {t("mentorsTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {MENTORS.map((m, i) => (
            <motion.div
              key={m.name}
              data-testid={`mentor-card-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              whileHover={{ scale: 1.02 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121620] transition-colors duration-500 hover:border-orange-500/40"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={m.img}
                  alt={m.name}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent" />
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button data-testid={`mentor-linkedin-${i}`} className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-orange-500" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button data-testid={`mentor-portfolio-${i}`} className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-orange-500" aria-label="Portfolio">
                    <Globe className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bangla text-lg font-semibold text-white">{m.name}</h3>
                <p className="mb-3 text-sm text-orange-400/90">{m.role}</p>
                <div className="font-bangla flex items-center gap-3 text-xs text-slate-500">
                  <span>{m.exp}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>{m.students}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
