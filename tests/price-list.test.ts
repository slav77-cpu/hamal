import { describe, expect, it } from 'vitest';
import type { Pricing } from '../src/data/pricing';
import { buildPriceList } from '../src/lib/price-list';

const NBSP = ' ';

// Примерни стойности само за теста — не са истински цени
const sample: Pricing = {
  porterPerHour: 15,
  vanPerHour: 25,
  minHours: 2,
  minOrderPorters: 2,
  perFloor: 3,
  perKm: 1,
  jobs: {
    studio: { label: 'Гарсониера', porters: 2, hours: [2, 3] },
    twoRoom: { label: 'Двустаен', porters: 3, hours: [3, 5] },
    threeRoom: { label: 'Тристаен', porters: 4, hours: [4, 6] },
    house: { label: 'Къща', porters: 4, hours: [6, 9] },
  },
  extras: {
    assembly: { label: 'Демонтаж и монтаж', price: 20 },
    packing: { label: 'Опаковане', price: 30 },
    junkRemoval: { label: 'Извозване на стари мебели', price: 40 },
  },
  servicesFrom: {},
};

describe('ценоразпис (т. 6)', () => {
  const rows = buildPriceList(sample);

  it('редовете са в реда от заданието', () => {
    expect(rows.map((r) => r.label)).toEqual([
      'Хамалин',
      'Бус с шофьор, в града',
      'Минимална поръчка',
      'Етаж без асансьор',
      'Извън града',
      'Демонтаж и монтаж на мебели',
      'Извозване на стари мебели и отпадъци',
      'Опаковъчни материали',
    ]);
  });

  it('цените и единиците идват от pricing', () => {
    const byKey = Object.fromEntries(rows.map((r) => [r.key, `${r.price} | ${r.unit}`]));
    expect(byKey).toEqual({
      porter: `от${NBSP}15${NBSP}€ | на час`,
      van: `от${NBSP}25${NBSP}€ | на час`,
      minOrder: `2${NBSP}часа | —`,
      floor: `3${NBSP}€ | на етаж`,
      outOfTown: `1${NBSP}€ | на км`,
      assembly: `от${NBSP}20${NBSP}€ | на брой или на час`,
      junkRemoval: `от${NBSP}40${NBSP}€ | на курс`,
      materials: 'по заявка | —',
    });
  });

  it('без цени показва „…“, а не 0', () => {
    const empty = buildPriceList({
      ...sample,
      porterPerHour: 0,
      minHours: 0,
      perFloor: 0,
      extras: { ...sample.extras, assembly: { label: '', price: 0 } },
    });
    const text = empty.map((r) => r.price).join(' ');
    expect(text).not.toMatch(/(^|\D)0\D/);
    expect(empty[0].price).toBe(`от${NBSP}…${NBSP}€`);
  });
});
