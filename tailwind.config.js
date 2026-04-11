/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Primary (Brand Magenta) ───────────────────
        "primary":                 "#da336b",
        "on-primary":              "#ffffff",
        "primary-container":       "#ffdae2",
        "on-primary-container":    "#3f001c",
        "primary-fixed":           "#ffd9df",
        "primary-fixed-dim":       "#ffb1c1",
        // ── Secondary ────────────────────────────────
        "secondary":               "#9b3f58",
        "on-secondary":            "#ffffff",
        "secondary-container":     "#fe8fa9",
        "on-secondary-container":  "#78243e",
        "secondary-fixed":         "#ffd9df",
        "secondary-fixed-dim":     "#ffb1c1",
        // ── Surfaces & Background ─────────────────────
        "background":              "#fff8f7",
        "on-background":           "#26181a",
        "surface":                 "#fff8f7",
        "on-surface":              "#26181a",
        "surface-variant":         "#f7dcdf",
        "on-surface-variant":      "#594045",
        "surface-bright":          "#fff8f7",
        "surface-dim":             "#eed4d7",
        "surface-tint":            "#da336b",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#fff0f1",
        "surface-container":         "#ffe9eb",
        "surface-container-high":    "#fce2e5",
        "surface-container-highest": "#f7dcdf",
        // ── Outline ───────────────────────────────────
        "outline":          "#8d7075",
        "outline-variant":  "#e1bec3",
        // ── Error ─────────────────────────────────────
        "error":            "#ba1a1a",
        "on-error":         "#ffffff",
        "error-container":  "#ffdad6",
        "on-error-container": "#93000a",
        // ── Inverse ───────────────────────────────────
        "inverse-surface":    "#3c2c2f",
        "inverse-on-surface": "#ffecee",
        "inverse-primary":    "#ffb1c1",
        // ── Brand alias ───────────────────────────────
        "brand": "#da336b",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg:   "0.25rem",
        xl:   "0.5rem",
        full: "0.75rem",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body:     ["Manrope", "sans-serif"],
        label:    ["Manrope", "sans-serif"],
        display:  ["Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        editorial: "0 8px 24px rgba(218, 51, 107, 0.06)",
        card:      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        nav:       "0 -2px 10px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
}
