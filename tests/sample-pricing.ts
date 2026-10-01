// Примерни цени само за тестовете — не са истински и не се показват на сайта.
import type { Pricing } from '../src/data/pricing';

export const samplePricing: Pricing = {
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
