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
        // Aesthetic Tactical Orange Palette
        brand: {
          orange: "#ff6b2c",
          glow: "#ff4b1f",
          dark: "#d9480f",
          amber: "#f59e0b",
          cyan: "#00e5ff",
          emerald: "#10b981",
          crimson: "#ef4444"
        },
        surface: {
          DEFAULT: "#0a0c10",
          panel: "#12151d",
          card: "#181c26",
          highest: "#222736",
          border: "rgba(255, 255, 255, 0.08)",
          borderOrange: "rgba(255, 107, 44, 0.35)"
        },
        "primary": "#ff6b2c",
        "primary-container": "#ff4b1f",
        "on-primary": "#ffffff",
        "secondary": "#10b981",
        "secondary-container": "#00a572",
        "tertiary": "#f59e0b",
        "error": "#ef4444",
        "background": "#08090d",
        "on-background": "#f1f5f9",
        "on-surface": "#f1f5f9",
        "on-surface-variant": "#94a3b8",
        "outline": "#334155",
        "outline-variant": "rgba(255, 255, 255, 0.12)"
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.625rem",
        "xl": "0.875rem",
        "2xl": "1.25rem",
        "full": "9999px"
      },
      fontFamily: {
        "sans": ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        "mono": ["'JetBrains Mono'", "monospace"],
        "data-mono": ["'JetBrains Mono'", "monospace"],
        "headline-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-sm": ["'Plus Jakarta Sans'", "sans-serif"]
      }
    }
  },
  plugins: []
}
