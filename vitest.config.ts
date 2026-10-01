/// <reference types="vitest/config" />
// getViteConfig дава на тестовете същата настройка като Astro — за да се рендират и .astro компоненти.
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
