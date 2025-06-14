/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'azul-profundo': '#181F3A',
        'roxo-eletrico': '#7B4BFF',
        'prata': '#C0C0C0',
        'verde-floresta': '#2E8B57',
        'dourado': '#FFD700',
      },
    },
  },
  plugins: [],
}
