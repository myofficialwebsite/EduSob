import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/components/landing/LanguageContext";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Manifesto } from "@/components/landing/Manifesto";
import { Courses } from "@/components/landing/Courses";
import { Stats } from "@/components/landing/Stats";
import { Mentors } from "@/components/landing/Mentors";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { EnrollForm } from "@/components/landing/EnrollForm";
import { Footer } from "@/components/landing/Footer";

const Home = () => {
  const [preselectedCourse, setPreselectedCourse] = useState("");

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="grain min-h-screen bg-[#0b0d12] text-slate-100" data-testid="edusob-landing">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Courses onEnroll={setPreselectedCourse} />
        <Stats />
        <Mentors />
        <Testimonials />
        <FAQ />
        <EnrollForm preselectedCourse={preselectedCourse} />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LangProvider>
      <Toaster theme="dark" position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
