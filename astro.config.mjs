// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/data/site.ts';

// https://astro.build/config
export default defineConfig({
  // Домейнът идва от src/data/site.ts
  site: site.url,
  // Адресите са без наклонена черта в края: /ceni, /uslugi/premestvane-na-dom
  trailingSlash: 'never',
  // Лентата с инструменти на Astro в dev режим закрива лентата за контакт на телефон
  devToolbar: { enabled: false },
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/blagodarim'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
