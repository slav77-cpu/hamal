import { describe, expect, it } from 'vitest';
import {
  formatCount,
  formatHours,
  formatPhone,
  formatPrice,
  formatPriceFrom,
  inCity,
} from '../src/lib/format';

const NBSP = '\u00A0';

describe('formatPrice', () => {
  it('показва цели евро с неразделящ интервал', () => {
    expect(formatPrice(120)).toBe(`120${NBSP}€`);
    expect(formatPrice(49.6)).toBe(`50${NBSP}€`);
  });

  it('показва „… €“, докато цената е 0', () => {
    expect(formatPrice(0)).toBe(`…${NBSP}€`);
    expect(formatPriceFrom(0)).toBe(`от${NBSP}…${NBSP}€`);
  });

  it('добавя „от“', () => {
    expect(formatPriceFrom(35)).toBe(`от${NBSP}35${NBSP}€`);
  });
});

describe('formatHours и formatCount', () => {
  it('показва диапазон или едно число', () => {
    expect(formatHours([3, 5])).toBe(`3–5${NBSP}часа`);
    expect(formatHours([4, 4])).toBe(`4${NBSP}часа`);
    expect(formatHours([1, 1])).toBe(`1${NBSP}час`);
  });

  it('показва „…“, докато стойността е 0', () => {
    expect(formatHours([0, 0])).toBe(`…${NBSP}часа`);
    expect(formatCount(0)).toBe('…');
    expect(formatCount(3)).toBe('3');
  });
});

describe('inCity', () => {
  it('ползва „във“ пред „в“ и „ф“', () => {
    expect(inCity('София')).toBe('в София');
    expect(inCity('Варна')).toBe('във Варна');
    expect(inCity('Враца')).toBe('във Враца');
    expect(inCity('[ГРАД]')).toBe('в [ГРАД]');
  });
});

describe('formatPhone', () => {
  it('показва български номер в местен формат', () => {
    expect(formatPhone('+359881234567')).toBe('088 123 4567');
    expect(formatPhone('0881234567')).toBe('088 123 4567');
    expect(formatPhone('+359 88 123 4567')).toBe('088 123 4567');
  });

  it('връща непознат формат без промяна', () => {
    expect(formatPhone('12345')).toBe('12345');
  });
});
