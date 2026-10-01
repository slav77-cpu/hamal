// Хваща думи, в които кирилица и латиница са смесени (напр. „formат“) — такива грешки не се виждат на око.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const files = Object.keys(import.meta.glob('../src/**/*.{ts,tsx,astro}'));
const mixed = /[a-zA-Z][а-яА-Я]|[а-яА-Я][a-zA-Z]/;

it.each(files)('%s няма думи със смесени букви', (file) => {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const words = source.split(/[^\p{L}]+/u).filter((word) => mixed.test(word));
  expect(words).toEqual([]);
});
