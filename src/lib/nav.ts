// Линкове за менюто и футъра.

import { services } from '../data/services';

export const serviceLinks = services.map((s) => ({
  href: `/uslugi/${s.slug}`,
  label: s.title,
}));

export const mainLinks = [
  { href: '/ceni', label: 'Цени' },
  { href: '/za-nas', label: 'За нас' },
  { href: '/kontakti', label: 'Контакти' },
];
