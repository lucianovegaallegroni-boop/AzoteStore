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
        // Custom Palette Direct Colors
        "palette-1": "#121358",
        "palette-2": "#232F72",
        "palette-3": "#2F578A",
        "palette-4": "#36ADA3",
        "navy-dark": "#121358",
        "navy-deep": "#232F72",
        "steel-blue": "#2F578A",
        "teal-accent": "#36ADA3",

        // Primary: #232F72 (Deep Royal Navy)
        "primary": "#232F72",
        "primary-container": "#2F578A",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",
        "primary-fixed": "#dce3ff",
        "primary-fixed-dim": "#b5c4ff",
        "on-primary-fixed": "#121358",
        "on-primary-fixed-variant": "#1b255c",
        "inverse-primary": "#b5c4ff",
        "surface-tint": "#232F72",

        // Secondary: #2F578A (Steel Slate Blue)
        "secondary": "#2F578A",
        "secondary-container": "#416a9e",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#ffffff",
        "secondary-fixed": "#d8e4f8",
        "secondary-fixed-dim": "#adcbef",
        "on-secondary-fixed": "#121358",
        "on-secondary-fixed-variant": "#1d3a5e",

        // Tertiary: #36ADA3 (Teal / Turquoise Accent)
        "tertiary": "#36ADA3",
        "tertiary-container": "#258880",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffffff",
        "tertiary-fixed": "#b2f5ed",
        "tertiary-fixed-dim": "#70ddd0",
        "on-tertiary-fixed": "#00201d",
        "on-tertiary-fixed-variant": "#005049",

        // Surfaces & Backgrounds
        "background": "#f7f9fd",
        "on-background": "#121358",
        "surface": "#f7f9fd",
        "on-surface": "#121358",
        "surface-bright": "#f7f9fd",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff3fa",
        "surface-container": "#e4ecf6",
        "surface-container-high": "#dbe3ef",
        "surface-container-highest": "#d1dbe9",
        "surface-dim": "#cad4e3",
        "surface-variant": "#d1dbe9",
        "on-surface-variant": "#38435d",
        "outline": "#68748d",
        "outline-variant": "#b9c4d7",

        // Inverse Surface (Dark Navigation & Footer): #121358
        "inverse-surface": "#121358",
        "inverse-on-surface": "#eff2ff",

        // Error & Feedback
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "12px",
        "xl": "80px",
        "lg": "48px",
        "md": "24px",
        "margin-desktop": "64px",
        "xs": "4px",
        "base": "8px",
        "gutter": "24px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "display-lg-mobile": ["Montserrat", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Montserrat", "sans-serif"],
        "headline-lg-mobile": ["Montserrat", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "display-lg": ["Montserrat", "sans-serif"]
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-lg-mobile": ["32px", { lineHeight: "38px", letterSpacing: "-0.01em", fontWeight: "800" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }]
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 12px))' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scroll': 'scroll 25s linear infinite',
      }
    },
  },
  plugins: [],
}
