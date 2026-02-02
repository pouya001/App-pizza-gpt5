/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // NimbusFlow color palette
        nimbus: {
          dark: "#121212",
          darker: "#0a0a0a",
          glass: "rgba(255, 255, 255, 0.05)",
          glassBorder: "rgba(255, 255, 255, 0.1)",
        },
        // Dynamic weather colors
        weather: {
          day: "#60a5fa",        // Blue sky
          night: "#1e3a5f",      // Deep blue night
          sunrise: "#fb923c",    // Orange sunrise
          sunset: "#f472b6",     // Pink sunset
          rain: "#64748b",       // Slate gray rain
          storm: "#6366f1",      // Purple storm
          snow: "#e2e8f0",       // Light snow
          clear: "#38bdf8",      // Clear sky blue
        },
        // Accent colors for glow effects
        glow: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          purple: "#a855f7",
          pink: "#ec4899",
          orange: "#f97316",
          yellow: "#facc15",
        },
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "cloud-drift": "cloudDrift 20s linear infinite",
        "cloud-drift-slow": "cloudDrift 30s linear infinite",
        "rain-fall": "rainFall 1s linear infinite",
        "snow-fall": "snowFall 3s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "neon-pulse": "neonPulse 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(34, 211, 238, 0.6)" },
        },
        cloudDrift: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
        rainFall: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        snowFall: {
          "0%": { transform: "translateY(-10%) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.8" },
          "100%": { transform: "translateY(100vh) rotate(360deg)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        neonPulse: {
          "0%, 100%": { textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor" },
          "50%": { textShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(34, 211, 238, 0.3)",
        "glow-md": "0 0 20px rgba(34, 211, 238, 0.4)",
        "glow-lg": "0 0 40px rgba(34, 211, 238, 0.5)",
        "glow-cyan": "0 0 30px rgba(34, 211, 238, 0.5)",
        "glow-blue": "0 0 30px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 30px rgba(168, 85, 247, 0.5)",
        "glow-orange": "0 0 30px rgba(249, 115, 22, 0.5)",
        "glow-pink": "0 0 30px rgba(236, 72, 153, 0.5)",
        "inner-glow": "inset 0 0 20px rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
