// Отзиви от клиенти (3–5). Само истински, с разрешение — не се измислят.
// Линкът към Google профила е в site.ts → googleProfileUrl.

export interface Review {
  name: string;
  text: string;
}

export const reviews: Review[] = [
  { name: '[Име]', text: '[Текст на отзива]' }, // TODO
  { name: '[Име]', text: '[Текст на отзива]' }, // TODO
  { name: '[Име]', text: '[Текст на отзива]' }, // TODO
];
