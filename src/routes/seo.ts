// এডুসব — SEO ইনফ্রা: robots.txt ও sitemap.xml
//
// আগে দুটোই ছিল না (HTTP 404)। ফলে সার্চ ইঞ্জিন ক্রলারদের কোনো রোডম্যাপ
// পেত না এবং Google Search Console-এ সাইটম্যাপ জমা দেওয়া যেত না।
//
// নিয়ম:
//   • /admin, /api, /dashboard, /profile, /wallet — ক্রল করা যাবে না (ব্যক্তিগত/প্রশাসনিক)
//   • সাইটম্যাপে শুধু সেই রুটগুলো আছে যেগুলো সত্যিই পাবলিক ও ইনডেক্সেবল
//     (noindex পেজ ঢোকানো হয়নি — সাইটম্যাপ ও noindex একে অপরের বিপরীত সংকেত)
import { Hono } from 'hono'

export const SITE_ORIGIN = 'https://edusob.pages.dev'

/** পাবলিক + ইনডেক্সেবল রুট — priority সহ (সাইটম্যাপে ব্যবহৃত) */
export const SITEMAP_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/results', priority: '0.9', changefreq: 'daily' },
  { path: '/admission', priority: '0.9', changefreq: 'daily' },
  { path: '/scholarships', priority: '0.8', changefreq: 'weekly' },
  { path: '/mcq', priority: '0.8', changefreq: 'weekly' },
  { path: '/qpapers', priority: '0.8', changefreq: 'weekly' },
  { path: '/syllabus', priority: '0.7', changefreq: 'monthly' },
  { path: '/notices', priority: '0.8', changefreq: 'daily' },
  { path: '/jobs', priority: '0.8', changefreq: 'daily' },
  { path: '/news', priority: '0.7', changefreq: 'daily' },
  { path: '/cv', priority: '0.8', changefreq: 'monthly' },
  { path: '/teacher-support', priority: '0.7', changefreq: 'weekly' },
  { path: '/board-challenge', priority: '0.6', changefreq: 'monthly' },
  { path: '/planner', priority: '0.6', changefreq: 'monthly' },
  { path: '/cgpa', priority: '0.6', changefreq: 'monthly' },
  { path: '/shop', priority: '0.6', changefreq: 'weekly' },
  { path: '/subscription', priority: '0.7', changefreq: 'monthly' },
]

const ROBOTS_TXT = `# এডুসব (EduSob) — https://edusob.pages.dev
# বাংলাদেশের শিক্ষার্থীদের ডিজিটাল শিক্ষা সুপার-পোর্টাল

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /profile
Disallow: /wallet
Disallow: /assisted
Disallow: /admin/cv-templates

# AI ক্রলারদের জন্য স্পষ্ট নির্দেশ (উদ্ধৃতি/প্রশিক্ষণ ব্যবহার নীতি আলাদা নয়)
User-agent: GPTBot
Disallow: /admin
Disallow: /api

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

/** YYYY-MM-DD — sitemap-এর lastmod ফিল্ডের জন্য */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildSitemap(): string {
  const lastmod = today()
  const urls = SITEMAP_ROUTES.map(
    (r) => `  <url>
    <loc>${SITE_ORIGIN}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- এডুসব — ${SITEMAP_ROUTES.length}টি পাবলিক পেজ। noindex পেজ এখানে নেই। -->
${urls}
</urlset>
`
}

const seo = new Hono()

seo.get('/robots.txt', (c) =>
  c.body(ROBOTS_TXT, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400',
  }),
)

seo.get('/sitemap.xml', (c) =>
  c.body(buildSitemap(), 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  }),
)

export default seo
