import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Organic Modernism Color Palette
        forest: {
          DEFAULT: "#1A4D2E",
          light: "#2D6B4D",
          dark: "#0F3D1E",
        },
        burnt: {
          DEFAULT: "#E07A5F",
          light: "#E8A090",
          dark: "#C45A3F",
        },
        charcoal: {
          DEFAULT: "#2D3748",
          light: "#4A5568",
          dark: "#1A202C",
        },
        cream: {
          DEFAULT: "#FDFBF7",
          warm: "#FAF6F0",
          cool: "#F8F9FA",
        },
        sage: {
          DEFAULT: "#F0F4F0",
          light: "#F5F8F5",
          dark: "#D4DED4",
        },
        // Legacy colors for compatibility
        mint: "hsl(var(--mint))",
        lavender: {
          DEFAULT: "hsl(var(--lavender))",
          light: "hsl(var(--lavender-light))",
        },
        peach: {
          DEFAULT: "hsl(var(--peach))",
          light: "hsl(var(--peach-light))",
        },
        coral: "hsl(var(--coral))",
        sky: {
          DEFAULT: "hsl(var(--sky))",
          light: "hsl(var(--sky-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      fontFamily: {
        // Premium Typography System
        serif: [
          "Playfair Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        body: [
          "Plus Jakarta Sans",
          "Inter",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-xl": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 1rem)",
        "safe-top": "env(safe-area-inset-top, 0)",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        "organic-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(4px) rotate(-1deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "dock-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(26, 77, 46, 0.2), 0 0 40px rgba(26, 77, 46, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(26, 77, 46, 0.3), 0 0 60px rgba(26, 77, 46, 0.15)" },
        },
        "ring-glow": {
          "0%, 100%": { strokeOpacity: "0.8" },
          "50%": { strokeOpacity: "1" },
        },
        "orb-breathe": {
          "0%, 100%": { transform: "scale(1)", filter: "blur(40px)" },
          "50%": { transform: "scale(1.1)", filter: "blur(50px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 60s linear infinite",
        "organic-float": "organic-float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.25s ease-out forwards",
        "slide-up": "slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 2s linear infinite",
        "dock-glow": "dock-glow 3s ease-in-out infinite",
        "ring-glow": "ring-glow 2s ease-in-out infinite",
        "orb-breathe": "orb-breathe 4s ease-in-out infinite",
      },
      boxShadow: {
        // Organic Modernism Shadows - deep, soft, layered
        soft: "0 2px 16px -4px rgba(45, 55, 72, 0.08)",
        medium: "0 4px 24px -4px rgba(45, 55, 72, 0.12)",
        elevated: "0 8px 32px -8px rgba(45, 55, 72, 0.16)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.05)",
        "glass-xl": "0 24px 64px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)",
        "inner-glow": "inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0, 0, 0, 0.05)",
        "dock": "0 8px 40px rgba(26, 77, 46, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
        "dock-active": "0 0 24px rgba(26, 77, 46, 0.4), 0 8px 40px rgba(26, 77, 46, 0.2)",
        // Colored shadows — tinted depth that feels grounded
        "forest-glow": "0 4px 14px -3px rgba(26, 77, 46, 0.25)",
        "forest-glow-lg": "0 8px 24px -4px rgba(26, 77, 46, 0.3)",
        "burnt-glow": "0 4px 14px -3px rgba(224, 122, 95, 0.25)",
        "card-hover": "0 20px 56px rgba(26, 77, 46, 0.08), 0 8px 24px rgba(45, 55, 72, 0.06)",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
