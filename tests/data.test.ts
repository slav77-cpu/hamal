// Проверява, че данните в src/data са цели и съгласувани — и с placeholder-ите, и след попълване.
import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { pricing } from '../src/data/pricing';
import { services } from '../src/data/services';
import { faq } from '../src/data/faq';
import { reviews } from '../src/data/reviews';

describe('site.ts', () => {
  it('номерата са в международен формат', () => {
    for (const phone of [site.phone, site.viber, site.whatsapp]) {
      expect(phone).toMatch(/^\+359\d{8,9}$/);
    }
  });

  it('url е пълен адрес без наклонена черта в края', () => {
    expect(site.url).toMatch(/^https:\/\/[^/]+$/);
  });

  it('„Защо нас“ има 3–4 факта', () => {
    expect(site.whyUs.length).toBeGreaterThanOrEqual(3);
    expect(site.whyUs.length).toBeLessThanOrEqual(4);
  });
});

describe('pricing.ts', () => {
  const numbers: [string, number][] = [
    ['porterPerHour', pricing.porterPerHour],
    ['vanPerHour', pricing.vanPerHour],
    ['minHours', pricing.minHours],
    ['minOrderPorters', pricing.minOrderPorters],
    ['perFloor', pricing.perFloor],
    ['perKm', pricing.perKm],
    ...Object.entries(pricing.jobs).flatMap(([key, job]): [string, number][] => [
      [`jobs.${key}.porters`, job.porters],
      [`jobs.${key}.hours[0]`, job.hours[0]],
      [`jobs.${key}.hours[1]`, job.hours[1]],
    ]),
    ...Object.entries(pricing.extras).map(([key, extra]): [string, number] => [`extras.${key}`, extra.price]),
    ...Object.entries(pricing.servicesFrom).map(([slug, price]): [string, number] => [`servicesFrom.${slug}`, price]),
  ];

  it.each(numbers)('%s е цяло число ≥ 0', (_, value) => {
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  });

  it('часовете на всеки тип са „от ≤ до“', () => {
    for (const job of Object.values(pricing.jobs)) {
      expect(job.hours[0]).toBeLessThanOrEqual(job.hours[1]);
    }
  });
});

describe('services.ts', () => {
  it('има 3–5 услуги', () => {
    expect(services.length).toBeGreaterThanOrEqual(3);
    expect(services.length).toBeLessThanOrEqual(5);
  });

  it('slug-овете са уникални и на латиница', () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('всяка услуга има цена в pricing.servicesFrom и обратно', () => {
    expect(services.map((s) => s.slug).sort()).toEqual(Object.keys(pricing.servicesFrom).sort());
  });

  it('всяка услуга има 3–4 въпроса и списък „какво е включено“', () => {
    for (const s of services) {
      expect(s.faq.length).toBeGreaterThanOrEqual(3);
      expect(s.faq.length).toBeLessThanOrEqual(4);
      expect(s.included.length).toBeGreaterThan(0);
    }
  });

  it('текстовете на услугите не се повтарят', () => {
    const intros = services.map((s) => s.intro);
    expect(new Set(intros).size).toBe(intros.length);
  });
});

describe('faq.ts и reviews.ts', () => {
  it('има 5–7 общи въпроса', () => {
    expect(faq.length).toBeGreaterThanOrEqual(5);
    expect(faq.length).toBeLessThanOrEqual(7);
  });

  it('има 3–5 отзива', () => {
    expect(reviews.length).toBeGreaterThanOrEqual(3);
    expect(reviews.length).toBeLessThanOrEqual(5);
  });
});
