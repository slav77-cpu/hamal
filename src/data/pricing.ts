// Единственото място с цени (в евро, цели числа).
// Ценоразписът, пакетите, картите на услугите и калкулаторът четат оттук.
// Докато стойност е 0, на сайта вместо нея стои „… €“.
// TODO: всички стойности идват от клиента

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
  porterPerHour: 0, // c_p — хамалин на час // TODO
  vanPerHour: 0, // c_v — бус с шофьор на час, в града // TODO
  minHours: 0, // h_min — минимална поръчка в часове // TODO
  minOrderPorters: 0, // хамали за минималната поръчка // TODO
  perFloor: 0, // c_f — на етаж без асансьор // TODO
  perKm: 0, // c_d — на км извън града // TODO

  // Пакетите в ценоразписа се смятат от тези стойности по формулата на калкулатора
  jobs: {
    studio: { label: 'Гарсониера', porters: 0, hours: [0, 0] }, // TODO
    twoRoom: { label: 'Двустаен', porters: 0, hours: [0, 0] }, // TODO
    threeRoom: { label: 'Тристаен', porters: 0, hours: [0, 0] }, // TODO
    house: { label: 'Къща', porters: 0, hours: [0, 0] }, // TODO
  },

  extras: {
    assembly: { label: 'Демонтаж и монтаж', price: 0 }, // TODO
    packing: { label: 'Опаковане', price: 0 }, // TODO
    junkRemoval: { label: 'Извозване на стари мебели', price: 0 }, // TODO
  },

  // Цена „от“ на картата и страницата на всяка услуга (ключът е slug от services.ts)
  servicesFrom: {
    'premestvane-na-dom': 0, // TODO
    'premestvane-na-ofis': 0, // TODO
    'izvozvane-na-mebeli': 0, // TODO
    'montazh-na-mebeli': 0, // TODO
    'bus-s-hamali': 0, // TODO
  },
} satisfies Pricing;

export type JobKey = keyof typeof pricing.jobs;
export type ExtraKey = keyof typeof pricing.extras;
export type ServiceSlug = keyof typeof pricing.servicesFrom;
