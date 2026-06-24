/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Permet d'activer le mode sombre manuellement
  theme: {
    extend: {
      colors: {
        'brand': {
          'blue': '#0284c7',       // Bleu logo Al Karim Vision
          'blue-dark': '#0369a1',  // Bleu logo foncé
          'blue-light': '#f0f9ff', // Bleu très clair pour arrière-plan / sélections
          'blue-accent': '#0ea5e9', // Accentuation cyan-bleu
          'gray-dark': '#0f172a',  // Arrière-plan mode sombre corporatif (slate-900)
          'card-dark': '#1e293b',  // Cartes mode sombre (slate-800)
          'border-dark': '#334155' // Bordures mode sombre (slate-700)
        }
      },
      fontFamily: {
        'luxury': ['Inter', 'Playfair Display', 'serif'], // Fallback sur Inter pour un rendu plus corporatif et épuré
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}