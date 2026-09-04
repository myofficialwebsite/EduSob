import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { SEED_COURSES } from "./src/data/courses.js";

const enrollments = [];
const newsletterSubscribers = [];

function apiPlugin() {
  return {
    name: "api-server-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, "http://localhost:3000");
        
        if (url.pathname === "/api/health") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ status: "ok", count: SEED_COURSES.length }));
          return;
        }

        if (url.pathname === "/api/courses" && req.method === "GET") {
          const category = url.searchParams.get("category");
          const q = (url.searchParams.get("q") || "").toLowerCase().trim();

          let results = [...SEED_COURSES];
          if (category && category !== "all") {
            results = results.filter((c) => c.category === category);
          }
          if (q) {
            results = results.filter(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                (c.title_en && c.title_en.toLowerCase().includes(q)) ||
                c.mentor.toLowerCase().includes(q)
            );
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(results));
          return;
        }

        if (url.pathname.startsWith("/api/courses/") && req.method === "GET") {
          const courseId = url.pathname.replace("/api/courses/", "");
          const course = SEED_COURSES.find((c) => c.id === courseId);
          res.setHeader("Content-Type", "application/json");
          if (!course) {
            res.statusCode = 404;
            res.end(JSON.stringify({ detail: "Course not found" }));
          } else {
            res.end(JSON.stringify(course));
          }
          return;
        }

        if (url.pathname === "/api/enroll" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              const course = SEED_COURSES.find((c) => c.id === data.course_id);
              if (!course) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ detail: "কোর্সটি পাওয়া যায়নি" }));
                return;
              }
              const isCouponValid = (data.coupon || "").trim().toUpperCase() === "EDUSOB2026";
              const discount = isCouponValid ? 15 : 0;
              const pricePaid = isCouponValid ? Math.round(course.price * 0.85) : course.price;
              
              const record = {
                id: `ENR-${Date.now()}`,
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                course_id: data.course_id,
                course_title: course.title,
                price_paid: pricePaid,
                discount_percent: discount,
                created_at: new Date().toISOString(),
              };
              enrollments.push(record);

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(record));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ detail: "Invalid request payload" }));
            }
          });
          return;
        }

        if (url.pathname === "/api/newsletter" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              if (data.email) {
                newsletterSubscribers.push({ email: data.email, at: new Date().toISOString() });
              }
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, message: "সাবস্ক্রিপশন সম্পন্ন হয়েছে!" }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ detail: "Invalid request" }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
