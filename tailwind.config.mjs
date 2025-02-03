/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        saira: ['Saira', 'sans-serif'],
        neuton: ['Neuton', 'serif'],
      },
      letterSpacing: {
        'widest': '0.05em',
      },
      fontSize: {
        'body': ['1.375rem', '1.875rem'], // 22px with appropriate line height
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}