/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      fontFamily: {
        cartoon: ['"ZCOOL KuaiLe"', '"Fredoka"', '"Chalkboard SE"', '"Comic Sans MS"', '"PingFang SC"', 'sans-serif'],
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        comic: ['"Comic Sans MS"', '"Chalkboard SE"', '"Bubblegum Sans"', 'cursive', 'sans-serif']
      },
      boxShadow: {
        'stone-black': 'inset 2px 2px 4px rgba(255,255,255,0.35), 3px 4px 8px rgba(0,0,0,0.5)',
        'stone-white': 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.9), 3px 4px 8px rgba(0,0,0,0.25)',
        'board': '0 20px 35px -10px rgba(99, 59, 13, 0.3), 0 0 0 8px #C9934B, 0 0 0 12px #9C6724',
        'cartoon': '0 6px 0 rgba(0,0,0,0.15)',
        'cartoon-active': '0 2px 0 rgba(0,0,0,0.15)',
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
}

