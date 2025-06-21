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
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },        pulseSubtle: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(123, 75, 255, 0.3)' },
          '50%': { boxShadow: '0 0 0 10px rgba(123, 75, 255, 0)' },
        },
      },
    },
  },
  plugins: [],
}
