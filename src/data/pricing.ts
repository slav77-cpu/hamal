// Единственото място с цени (в евро, цели числа).
// Ценоразписът, пакетите, картите на услугите и калкулаторът четат оттук.
// Ако стойност е 0, на сайта вместо нея стои „… €“.
//
// Примерни цени за Пловдив (11.10.2026). Фирмите в Пловдив почти не публикуват цени („след оглед“);
// от обявите и насоките на бат Миро (хамалин 10–15 € на час, около 40 € за бус) — хамалин 10–15 €/час.
// За сравнение София (6 ценоразписа): хамалин 15–20 €/час, бус с шофьор 20–30 €/час, бус + 2 хамали
// 50–70 €/час, минимум 2 часа, извън града 0,50–1 €/км, извозване с бус 40–50 € на курс.
// Източници: bratyahamali.bg, hamalisofia.net, moemdanosim.com, hamali-presto.com, mhgroupe.eu,
// hamalibulgari.com, bazar.bg (Пловдив). TODO: всяка цена да се потвърди с бат Миро

export interface Job {
  label: string;
  porters: number; // n — брой хамали
  hours: [number, number]; // h — от … до … часа
}

export interface Extra {
  label: string;
  price: number; // цена „от“ в ценоразписа; калкулаторът я добавя към сумата
}

export interface Pricing {
  porterPerHour: number;
  vanPerHour: number;
  minHours: number;
  minOrderPorters: number;
  perFloor: number;
  perKm: number;
  jobs: Record<'studio' | 'twoRoom' | 'threeRoom' | 'house', Job>;
  extras: Record<'assembly' | 'packing' | 'junkRemoval', Extra>;
  servicesFrom: Record<string, number>;
}

export const pricing = {
  porterPerHour: 12, // c_p — хамалин на час (Пловдив 10–15 €, София 15–20 €) // TODO: примерна
  vanPerHour: 20, // c_v — бус с шофьор на час, в града (София 20–30 €) // TODO: примерна
  minHours: 2, // h_min — минимална поръчка в часове // TODO: примерна
  minOrderPorters: 2, // хамали за минималната поръчка // TODO: примерна
  perFloor: 5, // c_f — на етаж без асансьор, за цялото преместване // TODO: примерна
  perKm: 1, // c_d — на км извън града (≈ 0,50 € на км в двете посоки) // TODO: примерна

  // Пакетите в ценоразписа се смятат от тези стойности по формулата на калкулатора
  jobs: {
    studio: { label: 'Гарсониера', porters: 2, hours: [2, 3] }, // TODO: примерна
    twoRoom: { label: 'Двустаен', porters: 3, hours: [3, 5] }, // TODO: примерна
    threeRoom: { label: 'Тристаен', porters: 4, hours: [4, 6] }, // TODO: примерна
    house: { label: 'Къща', porters: 4, hours: [6, 9] }, // TODO: примерна
  },

  extras: {
    assembly: { label: 'Демонтаж и монтаж', price: 20 }, // TODO: примерна
    packing: { label: 'Опаковане', price: 15 }, // TODO: примерна
    junkRemoval: { label: 'Извозване на стари мебели', price: 40 }, // TODO: примерна — „около 40 € за бус“
  },

  // Цена „от“ на картата и страницата на всяка услуга (ключът е slug от services.ts)
  servicesFrom: {
    'premestvane-na-dom': 85, // = пакет „Гарсониера“ // TODO: примерна
    'premestvane-na-ofis': 88, // = минималната поръчка // TODO: примерна
    'izvozvane-na-mebeli': 40, // на курс // TODO: примерна
    'montazh-na-mebeli': 20, // TODO: примерна
    'bus-s-hamali': 32, // на час: бус с шофьор + 1 хамалин // TODO: примерна
  },
} satisfies Pricing;

export type JobKey = keyof typeof pricing.jobs;
export type ExtraKey = keyof typeof pricing.extras;
export type ServiceSlug = keyof typeof pricing.servicesFrom;
