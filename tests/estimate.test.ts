// Формулата от т. 7: P = max(h, h_min) × (n × c_p + c_v) + f × c_f + d × c_d + E
import { describe, expect, it } from 'vitest';
import type { Pricing } from '../src/data/pricing';
import { estimatePrice, floorsWithoutElevator, packageFrom, type EstimateInput } from '../src/lib/estimate';

// Примерни стойности само за теста — не са истински цени
const p: Pricing = {
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
    house: { label: 'Къща', porters: 4, hours: [1, 9] },
  },
  extras: {
    assembly: { label: 'Демонтаж и монтаж', price: 20 },
    packing: { label: 'Опаковане', price: 30 },
    junkRemoval: { label: 'Извозване на стари мебели', price: 40 },
  },
  servicesFrom: {},
};

const base: EstimateInput = {
  job: 'studio',
  fromFloor: 0,
  fromElevator: true,
  toFloor: 0,
  toElevator: true,
  km: 0,
  extras: [],
};

describe('estimatePrice', () => {
  it('гарсониера, партер, в града: 2×55 = 110 до 3×55 = 165', () => {
    expect(estimatePrice(base, p)).toEqual({ kind: 'range', min: 110, max: 165 });
  });

  it('двустаен, 4-ти етаж без асансьор → 2-ри с асансьор, 30 км, монтаж и опаковане', () => {
    // n × c_p + c_v = 3×15 + 25 = 70; f = 4 (2-рият е с асансьор); d = 30; E = 20 + 30
    // X = 3×70 + 4×3 + 30×1 + 50 = 302 → 300; Y = 5×70 + 12 + 30 + 50 = 442 → 445
    const input: EstimateInput = {
      job: 'twoRoom',
      fromFloor: 4,
      fromElevator: false,
      toFloor: 2,
      toElevator: true,
      km: 30,
      extras: ['assembly', 'packing'],
    };
    expect(estimatePrice(input, p)).toEqual({ kind: 'range', min: 300, max: 445 });
  });

  it('минималната поръчка важи, когато часовете са по-малко', () => {
    // къща: hours [1, 9], h_min = 2 → X = 2 × (4×15 + 25) = 170; Y = 9 × 85 = 765
    expect(estimatePrice({ ...base, job: 'house' }, p)).toEqual({ kind: 'range', min: 170, max: 765 });
  });

  it('офис и отделни вещи: минималната поръчка, без диапазон', () => {
    // h_min × (minOrderPorters × c_p + c_v) = 2 × (2×15 + 25) = 110
    expect(estimatePrice({ ...base, job: 'office' }, p)).toEqual({ kind: 'minOrder', price: 110, hours: 2 });
    expect(estimatePrice({ ...base, job: 'items', fromFloor: 5 }, p)).toEqual({ kind: 'minOrder', price: 110, hours: 2 });
  });

  it('закръгля X надолу и Y нагоре до 5 €', () => {
    // f = 1 етаж → +3 €: X = 113 → 110, Y = 168 → 170
    expect(estimatePrice({ ...base, fromFloor: 1, fromElevator: false }, p)).toEqual({
      kind: 'range',
      min: 110,
      max: 170,
    });
  });

  it('„цените предстоят“, докато нужна цена е 0', () => {
    const zero = { ...p, porterPerHour: 0 };
    expect(estimatePrice(base, zero)).toEqual({ kind: 'pending' });
    expect(estimatePrice({ ...base, job: 'office' }, zero)).toEqual({ kind: 'pending' });
    // етаж без асансьор, а цената на етаж е 0
    expect(estimatePrice({ ...base, fromFloor: 3, fromElevator: false }, { ...p, perFloor: 0 })).toEqual({
      kind: 'pending',
    });
    // избрана допълнителна услуга без цена
    const noPacking = { ...p, extras: { ...p.extras, packing: { label: 'Опаковане', price: 0 } } };
    expect(estimatePrice({ ...base, extras: ['packing'] }, noPacking)).toEqual({ kind: 'pending' });
    // без избрана допълнителна услуга нулевата ѝ цена не пречи
    expect(estimatePrice(base, noPacking).kind).toBe('range');
  });
});

describe('floorsWithoutElevator', () => {
  it('брои етажа само където няма асансьор; партерът е 0', () => {
    expect(floorsWithoutElevator({ fromFloor: 4, fromElevator: false, toFloor: 3, toElevator: false })).toBe(7);
    expect(floorsWithoutElevator({ fromFloor: 4, fromElevator: true, toFloor: 3, toElevator: false })).toBe(3);
    expect(floorsWithoutElevator({ fromFloor: 0, fromElevator: false, toFloor: 0, toElevator: false })).toBe(0);
    expect(floorsWithoutElevator({ fromFloor: -1, fromElevator: false, toFloor: 0, toElevator: false })).toBe(0);
  });
});

describe('packageFrom — цената „от“ на пакет е същата като долната граница на калкулатора', () => {
  it.each(['studio', 'twoRoom', 'threeRoom'] as const)('%s', (job) => {
    const calc = estimatePrice({ ...base, job }, p);
    expect(calc.kind).toBe('range');
    expect(packageFrom(job, p)).toBe(calc.kind === 'range' ? calc.min : NaN);
  });

  it('без цени връща 0 (на сайта: „… €“)', () => {
    expect(packageFrom('studio', { ...p, vanPerHour: 0 })).toBe(0);
  });
});
