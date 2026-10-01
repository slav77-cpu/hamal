// Форматиране на цени, часове и телефони за показване.
// Стойност 0 означава, че клиентът още не е дал данните → „…“.

const NBSP = '\u00A0';

/** 120 → „120 €“; 0 → „… €“ */
export function formatPrice(value: number): string {
  return `${value > 0 ? Math.round(value) : '…'}${NBSP}€`;
}

/** 120 → „от 120 €“ */
export function formatPriceFrom(value: number): string {
  return `от${NBSP}${formatPrice(value)}`;
}

/** 3 → „3“; 0 → „…“ — за брой хамали, часове и т.н. */
export function formatCount(value: number): string {
  return value > 0 ? String(value) : '…';
}

/** [3, 5] → „3–5 часа“; [4, 4] → „4 часа“; [1, 1] → „1 час“ */
export function formatHours([from, to]: readonly [number, number]): string {
  if (from <= 0 || to <= 0) return `…${NBSP}часа`;
  const range = from === to ? String(from) : `${from}–${to}`;
  return `${range}${NBSP}${to === 1 ? 'час' : 'часа'}`;
}

/** „в София“, но „във Варна“ и „във Враца“ */
export function inCity(city: string): string {
  return /^[ВвФф]/.test(city) ? `във ${city}` : `в ${city}`;
}

/** „+359881234567“ → „088 123 4567“; друг формат се връща без промяна */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  const match = /^(?:\+359|0)(\d{2})(\d{3})(\d{3,4})$/.exec(digits);
  if (!match) return phone;
  return `0${match[1]} ${match[2]} ${match[3]}`;
}

/** 300, 445 → „между 300 и 445 €“ */
export function formatPriceRange(min: number, max: number): string {
  return `между ${Math.round(min)} и ${Math.round(max)}${NBSP}€`;
}

/** 0 → „партер“; 3 → „етаж 3“ */
export function formatFloor(floor: number): string {
  return floor <= 0 ? 'партер' : `етаж${NBSP}${floor}`;
}
