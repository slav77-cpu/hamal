// Формата за запитване (т. 8): проверка на полетата и изпращане през Web3Forms.

import { site } from '../data/site';
import { formatPhone } from './format';

export interface QuoteValues {
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD от <input type="date">
  from: string;
  to: string;
  items: string;
}

export type QuoteErrors = Partial<Record<keyof QuoteValues, string>>;

// Имената на полетата — така се виждат в имейла, който получава фирмата
export const FIELD_NAMES = {
  name: 'Име',
  phone: 'Телефон',
  date: 'Дата на преместване',
  from: 'Откъде',
  to: 'Докъде',
  items: 'Какво се мести',
  quote: 'Калкулатор',
} as const;

/** „+359 88 123-4567“ → „+359881234567“; „00359…“ → „+359…“ */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().\/]/g, '').replace(/^00359/, '+359');
}

/** Български номер: +359… или 0…, с 8–9 цифри след кода */
export function isBulgarianPhone(phone: string): boolean {
  return /^(?:\+359|0)\d{8,9}$/.test(normalizePhone(phone));
}

/** today — днешната дата като YYYY-MM-DD */
export function validateQuote(values: QuoteValues, today: string): QuoteErrors {
  const errors: QuoteErrors = {};
  if (!values.name.trim()) errors.name = 'Напишете името си.';
  if (!values.phone.trim()) errors.phone = 'Напишете телефон за връзка.';
  else if (!isBulgarianPhone(values.phone)) errors.phone = 'Напишете български номер: +359… или 0…';
  if (values.date && values.date < today) errors.date = 'Изберете днешна или бъдеща дата.';
  return errors;
}

/** „2026-10-15“ → „15.10.2026“ */
const formatDate = (date: string) => date.split('-').reverse().join('.');

/** Данните за Web3Forms. botcheck е скритото поле срещу спам — истински човек не го отмята. */
export function buildPayload(values: QuoteValues, quote: string, accessKey: string, botcheck: boolean) {
  const payload: Record<string, string | boolean> = {
    access_key: accessKey,
    subject: `Запитване от сайта: ${values.name.trim()}`,
    from_name: site.name,
    botcheck,
    [FIELD_NAMES.name]: values.name.trim(),
    [FIELD_NAMES.phone]: formatPhone(normalizePhone(values.phone)),
  };
  if (values.date) payload[FIELD_NAMES.date] = formatDate(values.date);
  if (values.from.trim()) payload[FIELD_NAMES.from] = values.from.trim();
  if (values.to.trim()) payload[FIELD_NAMES.to] = values.to.trim();
  if (values.items.trim()) payload[FIELD_NAMES.items] = values.items.trim();
  if (quote) payload[FIELD_NAMES.quote] = quote;
  return payload;
}

export type SendResult = { ok: true } | { ok: false; reason: 'no-key' | 'failed' };

export async function sendQuote(
  payload: ReturnType<typeof buildPayload>,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  if (!payload.access_key) return { ok: false, reason: 'no-key' };
  try {
    const response = await fetchImpl('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { success?: boolean };
    return response.ok && data.success ? { ok: true } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
