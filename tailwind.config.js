module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'md2': '822px',
      'lg': '1024px',
      'lg2': '1204px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'primary': '#6363ac',
        'primary-foreground': '#fff',
        'destructive': '#ef4444',
        'destructive-foreground': '#fff',
        'accent': '#f4f4f5',
      },
      animation: {
        loading: 'rotate 1s linear infinite',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        pulseShadow: 'pulseShadow 2s ease-in-out infinite',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: 1 },
          '20%,50%': { opacity: 0 },
        },
        pulseShadow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.4)' },
          '50%': { boxShadow: '0 0 15px 6px rgba(236, 72, 153, 0.6)' },
        },
      },
    },
    fontFamily: {
      sans: ['Source Sans Pro', 'sans-serif'],
    },
  },
  plugins: [
		require('tailwindcss-animate'),
    function({ addUtilities }) {
      addUtilities({
        '.color-scheme-dark': {
          'color-scheme': 'dark',
        },
        '.color-scheme-light': {
          'color-scheme': 'light',
        },
      })
    },
	],
  darkMode: 'class'
}
