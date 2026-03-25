import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand (matches old app)
        primary: {
          DEFAULT: "#10b981", // emerald-500
          dark:    "#059669", // emerald-600
          light:   "#d1fae5", // emerald-100
        },
        accent:  "#1e293b",   // slate-800 — used for dark CTAs / nav blocks
        surface: "#f8fafc",   // slate-50  — card/section bg
        // Semantic helpers
        safe:    "#10b981",
        warning: "#f59e0b",
        danger:  "#ef4444",
        // Semantic CSS-var tokens
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['56px', { lineHeight: '0.9',  letterSpacing: '-0.03em', fontWeight: '900' }],
        h1:      ['36px', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        h2:      ['28px', { lineHeight: '1.2',  fontWeight: '700' }],
        h3:      ['20px', { lineHeight: '1.3',  fontWeight: '700' }],
        body:    ['16px', { lineHeight: '1.6',  fontWeight: '400' }],
        small:   ['14px', { lineHeight: '1.5',  fontWeight: '500' }],
        micro:   ['11px', { lineHeight: '1.4',  fontWeight: '700', letterSpacing: '0.1em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'emerald': '0 10px 40px -10px rgba(16, 185, 129, 0.3)',
        'card':    '0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)',
      },
    },
  },
  plugins: [],
};
export default config;
