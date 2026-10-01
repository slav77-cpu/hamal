import { describe, expect, it, vi } from 'vitest';
import { estimatePrice, type EstimateInput } from '../src/lib/estimate';
import { formatFloor, formatPriceRange } from '../src/lib/format';
import { describeQuote, getQuote, onQuote, setQuote } from '../src/lib/quote';
import { samplePricing as p } from './sample-pricing';

const NBSP = ' ';

const move: EstimateInput = {
  job: 'twoRoom',
  fromFloor: 4,
  fromElevator: false,
  toFloor: 2,
  toElevator: true,
  km: 30,
  extras: ['assembly', 'packing'],
};

describe('formatPriceRange и formatFloor', () => {
  it('„между X и Y €“', () => {
    expect(formatPriceRange(300, 445)).toBe(`между 300 и 445${NBSP}€`);
  });

  it('партерът е етаж 0', () => {
    expect(formatFloor(0)).toBe('партер');
    expect(formatFloor(3)).toBe(`етаж${NBSP}3`);
  });
});

describe('describeQuote — текстът за скритото поле на формата', () => {
  it('преместване: тип, етажи, разстояние, допълнително и диапазон', () => {
    expect(describeQuote(move, estimatePrice(move, p), p)).toBe(
      `Двустаен; етаж${NBSP}4 без асансьор → етаж${NBSP}2 с асансьор; извън града, 30 км; ` +
        `Демонтаж и монтаж, Опаковане; ориентировъчно между 300 и 445${NBSP}€`,
    );
  });

  it('партер в града, без допълнително', () => {
    const input: EstimateInput = { ...move, fromFloor: 0, toFloor: 0, km: 0, extras: [] };
    expect(describeQuote(input, estimatePrice(input, p), p)).toBe(
      `Двустаен; партер → партер; в града; ориентировъчно между 210 и 350${NBSP}€`,
    );
  });

  it('офис: само минималната поръчка', () => {
    const input: EstimateInput = { ...move, job: 'office' };
    expect(describeQuote(input, estimatePrice(input, p), p)).toBe(`Офис; минимална поръчка 2 ч — 110${NBSP}€`);
  });

  it('докато цените са 0 — без цена', () => {
    const input: EstimateInput = { ...move, job: 'studio', extras: [] };
    expect(describeQuote(input, { kind: 'pending' }, p)).toBe(
      `Гарсониера; етаж${NBSP}4 без асансьор → етаж${NBSP}2 с асансьор; извън града, 30 км`,
    );
  });
});

describe('споделеният избор между калкулатора и формата', () => {
  it('формата получава последния избор и промените след това', () => {
    setQuote('първи');
    expect(getQuote()).toBe('първи');
    const listener = vi.fn();
    const off = onQuote(listener);
    setQuote('втори');
    expect(listener).toHaveBeenCalledWith('втори');
    off();
    setQuote('трети');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
