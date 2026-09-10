// এডুসব — nonce-ভিত্তিক Content-Security-Policy (রাউন্ড ৮)
//
// অ্যাপে ১৩০+ ইনলাইন <script> ব্লক আছে, তাই আগে কড়া CSP দেওয়া যায়নি ('unsafe-inline'
// দিলে CSP-এর কোনো মানেই থাকে না)। এখন প্রতি রেসপন্সে একটি নতুন nonce তৈরি হয় এবং
// রেন্ডার-শেষে সব ইনলাইন <script> ট্যাগে সেটি বসিয়ে দেওয়া হয় — ফলে:
//   * ইনজেক্ট করা <script> ট্যাগ (XSS-এর প্রধান পথ) চলতেই পারবে না — nonce নেই
//   * 3rd-party স্ক্রিপ্ট লোড হতে পারবে না (script-src 'self')
//
// ⚠️ বাস্তব সীমাবদ্ধতা: অ্যাপজুড়ে ইনলাইন ইভেন্ট-হ্যান্ডলার (onclick="...") আছে —
// সেগুলো nonce দিয়ে কভার করা যায় না। তাই script-src-attr 'unsafe-inline' রাখা হয়েছে।
// অর্থাৎ: ইনজেক্টেড <script> বন্ধ, তবে হ্যান্ডলার-অ্যাট্রিবিউট ইনজেকশন সম্ভব হলে
// সেখানে এই CSP রক্ষা করবে না — মূল প্রতিরক্ষা সবসময়ই সার্ভার-সাইড HTML এস্কেপিং।

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function randomBase64(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  globalThis.crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    out += BASE64_CHARS[b0 >> 2]
    out += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)]
    out += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : ''
    out += i + 2 < bytes.length ? BASE64_CHARS[b2 & 63] : ''
  }
  return out
}

export function makeNonce(): string {
  return randomBase64(18) // ২৪ অক্ষর — প্রতি রিকোয়েস্টে অনুমান করা যায় না
}

export function cspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "'",
    // ইনলাইন onclick="..." হ্যান্ডলারগুলো বাঁচাতে — nonce দিয়ে এগুলো কভার করা যায় না
    "script-src-attr 'unsafe-inline'",
    // টেইলউইন্ড + সার্ভার-রেন্ডারড style="..." অ্যাট্রিবিউট
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    // পিডিএফ ডাউনলোডের hidden about:blank iframe-এর জন্য
    "frame-src 'self' blob: data: about:",
    "worker-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

// রেন্ডার হয়ে যাওয়া HTML-এর প্রতিটি <script> ট্যাগে nonce বসায়।
// nonce আগে থাকলে আর বসায় না (ডাবল-নন্স এড়াতে)।
export function injectScriptNonces(html: string, nonce: string): string {
  if (!html || nonce === '') return html
  return html.replace(/<script\b([^>]*)>/gi, (match, attrs: string) => {
    if (/\bnonce\s*=/i.test(attrs)) return match
    return '<script' + attrs + ' nonce="' + nonce + '">'
  })
}
