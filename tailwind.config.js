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
        'bustantech': {
          'sky': '#BAE6FD',
          'gold': '#0284c7',   // Bleu océan vibrant (remplace l'or)
          'gold-dark': '#0369a1', // Bleu océan foncé
          'white': '#FFFFFF',
          'black': '#121212',  // Noir profond pour le mode sombre
          'gray': '#1F1F1F',   // Gris anthracite pour les cartes en mode sombre
        }
      },
      fontFamily: {
        'luxury': ['Playfair Display', 'serif'], // Pour les titres
        'sans': ['Inter', 'sans-serif'],        // Pour le texte lisible
      }
    },
  },
  plugins: [],
}