// Отзиви от клиенти (3–5). Само истински, с разрешение — не се измислят.
// Линкът към Google профила е в site.ts → googleProfileUrl.

export interface Review {
  name: string;
  text: string;
  rating?: string; // напр. '5,0' — само ако е от истинския отзив
  meta?: string; // напр. 'Лозенец · март 2026'
}

export const reviews: Review[] = [
  { name: '[Име]', text: '[Текст на отзива]', rating: '[5,0]', meta: '[Квартал] · [месец]' }, // TODO
  { name: '[Име]', text: '[Текст на отзива]', rating: '[5,0]', meta: '[Квартал] · [месец]' }, // TODO
  { name: '[Име]', text: '[Текст на отзива]', rating: '[5,0]', meta: '[Квартал] · [месец]' }, // TODO
];
