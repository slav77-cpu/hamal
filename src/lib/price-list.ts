// Редовете на ценоразписа (т. 6 от заданието), готови за показване.
// Ползват ги „Цени накратко“ на началната страница и таблицата на /ceni.

import { pricing, type JobKey, type Pricing } from '../data/pricing';
import { packageFrom } from './estimate';
import { formatCount, formatHours, formatPrice, formatPriceFrom } from './format';

export type PriceRowKey =
  | 'porter'
  | 'van'
  | 'minOrder'
  | 'floor'
  | 'outOfTown'
  | 'assembly'
  | 'junkRemoval'
  | 'materials';

export interface PriceRow {
  key: PriceRowKey;
  label: string;
  unit: string; // „на час“; „—“, ако няма единица
  price: string; // „от 25 €“, „… €“, „по заявка“
}

export function buildPriceList(p: Pricing): PriceRow[] {
  return [
    { key: 'porter', label: 'Хамалин', unit: 'на час', price: formatPriceFrom(p.porterPerHour) },
    { key: 'van', label: 'Бус с шофьор, в града', unit: 'на час', price: formatPriceFrom(p.vanPerHour) },
    { key: 'minOrder', label: 'Минимална поръчка', unit: '—', price: formatHours([p.minHours, p.minHours]) },
    { key: 'floor', label: 'Етаж без асансьор', unit: 'на етаж', price: formatPrice(p.perFloor) },
    { key: 'outOfTown', label: 'Извън града', unit: 'на км', price: formatPrice(p.perKm) },
    {
      key: 'assembly',
      label: 'Демонтаж и монтаж на мебели',
      unit: 'на брой или на час',
      price: formatPriceFrom(p.extras.assembly.price),
    },
    {
      key: 'junkRemoval',
      label: 'Извозване на стари мебели и отпадъци',
      unit: 'на курс',
      price: formatPriceFrom(p.extras.junkRemoval.price),
    },
    { key: 'materials', label: 'Опаковъчни материали', unit: '—', price: 'по заявка' },
  ];
}

export const priceList = buildPriceList(pricing);

export const priceRow = (key: PriceRowKey) => priceList.find((row) => row.key === key)!;

export interface PackageRow {
  label: string;
  includes: string; // „3 хамали + бус, до 5 ч“
  price: string; // „от 300 €“ или „по запитване“
}

// Пакетите се смятат по формулата на калкулатора (партер, в града, без допълнителни),
// затова ценоразписът и калкулаторът винаги дават една и съща цена „от“.
const packageJobs: JobKey[] = ['studio', 'twoRoom', 'threeRoom'];

export function buildPackages(p: Pricing): PackageRow[] {
  return [
    ...packageJobs.map((key) => {
      const job = p.jobs[key];
      return {
        label: job.label,
        includes: `${formatCount(job.porters)} хамали + бус, до ${formatCount(job.hours[1])}\u00A0ч`,
        price: formatPriceFrom(packageFrom(key, p)),
      };
    }),
    { label: 'Офис', includes: 'след оглед', price: 'по запитване' },
  ];
}

export const packages = buildPackages(pricing);

// Стои под всяка таблица с цени
export const priceDisclaimer =
  'Цените са ориентировъчни. Точна цена по телефона или след снимки във Viber.';
