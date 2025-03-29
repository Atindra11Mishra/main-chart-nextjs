import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        purple: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Cyber theme colors
        "cyber-green": "#09FBD3",
        "cyber-blue": "#08F7FE",
        "cyber-pink": "#FE53BB",
        "cyber-yellow": "#F5D300",
        "dark-green": "#0F1922",
        "darker-green": "#071219",
        degen: {
          dark: "#0A1F1C",
          green: "#1E3A37",
          light: "#264D49",
          glow: "#36FF9C",
          accent: "#00E0B0",
        },
        defi: {
          dark: "#121217",
          green: {
            DEFAULT: "#ACFF7F",
            light: "#CBF9A0",
            neon: "#B0FF58",
            dark: "#43B309",
          },
          gray: {
            DEFAULT: "#222228",
            dark: "#1A1A1F",
            light: "#32323A",
          },
        },
      },
      backgroundImage: {
        "crystal-gradient":
          "radial-gradient(ellipse at top right, rgba(120,58,180,0.3), transparent 70%), radial-gradient(ellipse at bottom left, rgba(120,58,180,0.2), transparent 70%)",
        "gradient-dark": "linear-gradient(135deg, #0F1922 0%, #071219 100%)",
        "glass-card":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "cyber-gradient":
          "linear-gradient(135deg, rgba(9, 251, 211, 0.2) 0%, rgba(254, 83, 187, 0.2) 100%)",
        "shimmer-effect":
          "linear-gradient(90deg, transparent, rgba(9, 251, 211, 0.3), transparent)",
        "neon-glow":
          "radial-gradient(circle, rgba(172, 255, 127, 0.3) 0%, rgba(172, 255, 127, 0.1) 40%, rgba(0, 0, 0, 0) 70%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.3)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

