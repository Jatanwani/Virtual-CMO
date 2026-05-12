/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-cabinet)', 'serif'],
        body: ['var(--font-satoshi)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#FFF8F0',
          100: '#FFECD4',
          200: '#FFD4A3',
          300: '#FFB566',
          400: '#FF8C1A',
          500: '#E67300',
          600: '#CC6600',
          700: '#A35200',
          800: '#7A3D00',
          900: '#522900',
        },
        surface: {
          0: '#FFFFFF',
          1: '#FAFAF8',
          2: '#F5F3EF',
          3: '#EDE9E3',
          4: '#E2DDD5',
        },
        ink: {
          1: '#0D0C0B',
          2: '#2C2B29',
          3: '#524F4A',
          4: '#7A7670',
          5: '#A39E96',
          6: '#C9C4BC',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-dot': 'bounceDot 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(230, 115, 0, 0.15)',
        'glow-lg': '0 0 40px rgba(230, 115, 0, 0.2)',
        'card': '0 1px 3px rgba(13,12,11,0.06), 0 1px 2px rgba(13,12,11,0.04)',
        'card-hover': '0 4px 12px rgba(13,12,11,0.08), 0 2px 4px rgba(13,12,11,0.06)',
        'modal': '0 20px 60px rgba(13,12,11,0.15), 0 8px 24px rgba(13,12,11,0.08)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gradient-brand': 'linear-gradient(135deg, #FF8C1A 0%, #E67300 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1714 0%, #2C2B29 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};