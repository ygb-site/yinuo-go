/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        phone: '375px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '1440px'
      },
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          sunken: 'var(--color-surface-sunken)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          strong: 'var(--color-brand-strong)',
          soft: 'var(--color-brand-soft)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          'on-brand': 'var(--color-text-on-brand)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          soft: 'var(--color-info-soft)',
        },
        learning: 'var(--color-learning)',
        growth: 'var(--color-growth)',
        challenge: 'var(--color-challenge)',
        yinuo: {
          wood: '#E8B872',
          woodDark: '#C9934B',
          woodLight: '#FBE9CD',
          primary: '#FF6B6B',
          primaryHover: '#FA5252',
          secondary: '#4DABF7',
          accent: '#FFD43B',
          green: '#51CF66',
          purple: '#845EF7',
          dark: '#212529',
          board: '#DEAB62',
          boardLine: '#633B0D',
          stoneBlack: '#1E232A',
          stoneWhite: '#F8F9FA',
        }
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        e0: 'var(--elevation-0)',
        e1: 'var(--elevation-1)',
        e2: 'var(--elevation-2)',
        e3: 'var(--elevation-3)',
        e4: 'var(--elevation-4)',
        'stone-black': 'inset 2px 2px 4px rgba(255,255,255,0.35), 3px 4px 8px rgba(0,0,0,0.5)',
        'stone-white': 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.9), 3px 4px 8px rgba(0,0,0,0.25)',
        'board': '0 20px 35px -10px rgba(99, 59, 13, 0.3), 0 0 0 8px #C9934B, 0 0 0 12px #9C6724',
        'cartoon': '0 6px 0 rgba(0,0,0,0.15)',
        'cartoon-active': '0 2px 0 rgba(0,0,0,0.15)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        emphasis: 'var(--duration-emphasis)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        'ease-out': 'var(--ease-out)',
        'ease-in': 'var(--ease-in)',
        emphasis: 'var(--ease-emphasis)',
      },
      zIndex: {
        base: 'var(--z-base)',
        sticky: 'var(--z-sticky)',
        nav: 'var(--z-nav)',
        float: 'var(--z-float)',
        popover: 'var(--z-popover)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        loading: 'var(--z-loading)',
      },
      fontFamily: {
        sans: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        display: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        cartoon: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        comic: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s infinite ease-in-out',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

