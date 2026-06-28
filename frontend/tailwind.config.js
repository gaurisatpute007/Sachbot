export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:  { DEFAULT: '#1D9E75', dark: '#0F6E56', light: '#9FE1CB', xlight: '#E1F5EE' },
        danger: { DEFAULT: '#D85A30', light: '#FAECE7', dark: '#993C1D' },
        warn:   { DEFAULT: '#BA7517', light: '#FAEEDA', dark: '#854F0B' },
        safe:   { DEFAULT: '#3B6D11', light: '#EAF3DE', dark: '#27500A' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    }
  },
  plugins: []
}
