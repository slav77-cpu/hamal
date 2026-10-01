// Снимки на сайта. Засега са сиви placeholder-и от src/assets/placeholders.
// Истинските снимки се слагат в src/assets/photos и се сменят само тук;
// Astro ги прави на WebP/AVIF в нужните размери при build.
// TODO: истински снимки и описания (alt) от клиента

import type { ImageMetadata } from 'astro';
import hero from '../assets/placeholders/hero.jpg';
import object1 from '../assets/placeholders/object-1.jpg';
import object2 from '../assets/placeholders/object-2.jpg';
import object3 from '../assets/placeholders/object-3.jpg';
import object4 from '../assets/placeholders/object-4.jpg';
import object5 from '../assets/placeholders/object-5.jpg';
import object6 from '../assets/placeholders/object-6.jpg';
import areaMap from '../assets/placeholders/area-map.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
}

// Първи екран: екипът и бусът
export const heroPhoto: Photo = { src: hero, alt: '[Екипът и бусът на фирмата]' }; // TODO

// „Снимки от реални обекти“ — 6–9 снимки
export const gallery: Photo[] = [
  { src: object1, alt: '[Описание на снимката]' }, // TODO
  { src: object2, alt: '[Описание на снимката]' }, // TODO
  { src: object3, alt: '[Описание на снимката]' }, // TODO
  { src: object4, alt: '[Описание на снимката]' }, // TODO
  { src: object5, alt: '[Описание на снимката]' }, // TODO
  { src: object6, alt: '[Описание на снимката]' }, // TODO
];

// /kontakti: статична снимка на района (без вграден Google Maps — без бисквитки)
export const areaMapPhoto: Photo = { src: areaMap, alt: '[Карта на района, в който работи фирмата]' }; // TODO
