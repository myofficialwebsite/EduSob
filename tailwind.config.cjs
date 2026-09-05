/** Tailwind v3 config — compiled at build time (replaces cdn.tailwindcss.com) */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  safelist: [
    // landing.ts result-hub cards use interpolated ${col} classes
    ...['emerald', 'teal', 'amber', 'sky'].flatMap((c) => [
      `border-${c}-500/30`,
      `bg-${c}-500/20`,
      `text-${c}-400`,
    ]),
  ],
  theme: { extend: {} },
  plugins: [],
}
