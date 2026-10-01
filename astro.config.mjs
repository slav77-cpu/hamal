// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
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
  // Шрифтовете от design/DESIGN.md. Astro ги сваля при build и ги сервира от нашия домейн
  // (без заявки към Google), с предварително зареждане и изравнен резервен шрифт — текстът не подскача.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Sofia Sans',
      cssVariable: '--font-sofia',
      weights: ['400 800'],
      styles: ['normal', 'italic'],
      subsets: ['cyrillic', 'latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Sofia Sans Condensed',
      cssVariable: '--font-sofia-condensed',
      weights: ['700 900'],
      styles: ['normal'],
      subsets: ['cyrillic', 'latin'],
      fallbacks: ['sans-serif'],
    },
  ],
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
