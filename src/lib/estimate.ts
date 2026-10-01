// Ориентировъчна цена — формулата от т. 7 на заданието:
//
//   P = max(h, h_min) × (n × c_p + c_v) + f × c_f + d × c_d + E
//
// Долната граница се смята с hours[0], горната — с hours[1].
// X се закръгля надолу, Y — нагоре, до 5 €.
// За „офис“ и „отделни вещи“ няма диапазон — връща се минималната поръчка.

import { pricing as defaultPricing, type ExtraKey, type JobKey, type Pricing } from '../data/pricing';

export type JobType = JobKey | 'office' | 'items';

export interface EstimateInput {
  job: JobType;
  fromFloor: number; // партерът е етаж 0
  fromElevator: boolean;
  toFloor: number;
  toElevator: boolean;
  km: number; // км извън града; 0 = в града
  extras: ExtraKey[];
}

export type Estimate =
  | { kind: 'range'; min: number; max: number }
  | { kind: 'minOrder'; price: number; hours: number }
  // Някоя от нужните цени още е 0 — калкулаторът показва, че цените предстоят
  | { kind: 'pending' };

const STEP = 5;
const roundDown = (value: number) => Math.floor(value / STEP) * STEP;
const roundUp = (value: number) => Math.ceil(value / STEP) * STEP;

/** Етажи без асансьор: етажът се брои само където няма асансьор */
export function floorsWithoutElevator(input: Pick<EstimateInput, 'fromFloor' | 'fromElevator' | 'toFloor' | 'toElevator'>) {
  const floors = (floor: number, elevator: boolean) => (elevator ? 0 : Math.max(0, Math.floor(floor)));
  return floors(input.fromFloor, input.fromElevator) + floors(input.toFloor, input.toElevator);
}

export function estimatePrice(input: EstimateInput, p: Pricing = defaultPricing): Estimate {
  const { porterPerHour: cp, vanPerHour: cv, minHours } = p;

  if (input.job === 'office' || input.job === 'items') {
    if (!(cp > 0 && cv > 0 && minHours > 0 && p.minOrderPorters > 0)) return { kind: 'pending' };
    return { kind: 'minOrder', price: minHours * (p.minOrderPorters * cp + cv), hours: minHours };
  }

  const job = p.jobs[input.job];
  const f = floorsWithoutElevator(input);
  const d = Math.max(0, input.km);
  const extras = input.extras.map((key) => p.extras[key].price);

  const ready =
    cp > 0 &&
    cv > 0 &&
    minHours > 0 &&
    job.porters > 0 &&
    job.hours[0] > 0 &&
    job.hours[1] >= job.hours[0] &&
    (f === 0 || p.perFloor > 0) &&
    (d === 0 || p.perKm > 0) &&
    extras.every((price) => price > 0);
  if (!ready) return { kind: 'pending' };

  const perHour = job.porters * cp + cv;
  const fixed = f * p.perFloor + d * p.perKm + extras.reduce((sum, price) => sum + price, 0);
  const total = (hours: number) => Math.max(hours, minHours) * perHour + fixed;

  return {
    kind: 'range',
    min: roundDown(total(job.hours[0])),
    max: roundUp(total(job.hours[1])),
  };
}

/** Цена „от“ за пакет в ценоразписа: партер, в града, без допълнителни — долната граница */
export function packageFrom(job: JobKey, p: Pricing = defaultPricing): number {
  const estimate = estimatePrice(
    { job, fromFloor: 0, fromElevator: true, toFloor: 0, toElevator: true, km: 0, extras: [] },
    p,
  );
  return estimate.kind === 'range' ? estimate.min : 0;
}
