import { describe, expect, it, vi } from 'vitest';
import { site } from '../src/data/site';
import {
  buildPayload,
  isBulgarianPhone,
  normalizePhone,
  sendQuote,
  validateQuote,
  type QuoteValues,
} from '../src/lib/quote-form';

const valid: QuoteValues = { name: 'Иван', phone: '0881234567', date: '', from: '', to: '', items: '' };
const TODAY = '2026-10-01';

describe('телефон: български номер +359… или 0…', () => {
  it.each(['0881234567', '+359881234567', '+359 88 123 4567', '088-123-4567', '029876543', '00359881234567'])(
    '%s — да',
    (phone) => expect(isBulgarianPhone(phone)).toBe(true),
  );

  it.each(['', '12345', '881234567', '+44 20 7946 0958', '08812345678901', 'нямам'])('%s — не', (phone) =>
    expect(isBulgarianPhone(phone)).toBe(false),
  );

  it('чисти интервали и тирета; 00359 става +359', () => {
    expect(normalizePhone('+359 (88) 123-45.67')).toBe('+359881234567');
    expect(normalizePhone('00359881234567')).toBe('+359881234567');
  });
});

describe('validateQuote', () => {
  it('име и телефон са задължителни, другото — не', () => {
    expect(validateQuote(valid, TODAY)).toEqual({});
    expect(validateQuote({ ...valid, name: '  ', phone: '' }, TODAY)).toEqual({
      name: 'Напишете името си.',
      phone: 'Напишете телефон за връзка.',
    });
  });

  it('грешен номер', () => {
    expect(validateQuote({ ...valid, phone: '12345' }, TODAY).phone).toBe('Напишете български номер: +359… или 0…');
  });

  it('датата не може да е минала', () => {
    expect(validateQuote({ ...valid, date: '2026-09-30' }, TODAY).date).toBe('Изберете днешна или бъдеща дата.');
    expect(validateQuote({ ...valid, date: TODAY }, TODAY)).toEqual({});
  });
});

describe('buildPayload — какво получава фирмата', () => {
  it('всички полета с български имена, четим телефон и дата', () => {
    const payload = buildPayload(
      { name: ' Иван ', phone: '+359 88 123 4567', date: '2026-10-15', from: 'Лозенец', to: 'Младост', items: 'Диван' },
      'Двустаен; партер → партер',
      'test-key',
      false,
    );
    expect(payload).toEqual({
      access_key: 'test-key',
      subject: 'Запитване от сайта: Иван',
      from_name: site.name,
      botcheck: false,
      Име: 'Иван',
      Телефон: '088 123 4567',
      'Дата на преместване': '15.10.2026',
      Откъде: 'Лозенец',
      Докъде: 'Младост',
      'Какво се мести': 'Диван',
      Калкулатор: 'Двустаен; партер → партер',
    });
  });

  it('празните полета не се пращат', () => {
    expect(Object.keys(buildPayload(valid, '', 'k', false))).toEqual([
      'access_key',
      'subject',
      'from_name',
      'botcheck',
      'Име',
      'Телефон',
    ]);
  });
});

describe('sendQuote', () => {
  const payload = buildPayload(valid, '', 'test-key', false);
  const respond = (body: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, json: async () => body });

  it('праща JSON към Web3Forms', async () => {
    const fetchMock = respond({ success: true });
    expect(await sendQuote(payload, fetchMock)).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.web3forms.com/submit');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(payload);
  });

  it('грешка от Web3Forms или от мрежата', async () => {
    expect(await sendQuote(payload, respond({ success: false, message: 'Invalid' }, false))).toEqual({
      ok: false,
      reason: 'failed',
    });
    expect(await sendQuote(payload, vi.fn().mockRejectedValue(new Error('offline')))).toEqual({
      ok: false,
      reason: 'failed',
    });
  });

  it('без ключ не праща нищо', async () => {
    const fetchMock = vi.fn();
    expect(await sendQuote(buildPayload(valid, '', '', false), fetchMock)).toEqual({ ok: false, reason: 'no-key' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
