// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ajcipher.github.io',
  base: '/writeups-hacking', // <- importante para GitHub Pages
  vite: {
    plugins: [tailwindcss()]
  }
});
