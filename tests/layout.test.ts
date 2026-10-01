// Рендира страница с Base.astro и проверява общите части: горна лента, футър, лента за контакт.
import { createContainer } from './container';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';
import IndexPage from '../src/pages/index.astro';
import { contact } from '../src/lib/links';
import { services } from '../src/data/services';
import { site } from '../src/data/site';

let document: Document;

beforeAll(async () => {
  const container = await createContainer();
  const html = await container.renderToString(IndexPage, {
    request: new Request('https://example.com/'),
  });
  document = parseHTML(html).document;
});

const hrefs = (selector: string) =>
  [...document.querySelectorAll<HTMLAnchorElement>(`${selector} a`)].map((a) => a.getAttribute('href'));

describe('Base.astro', () => {
  it('страницата е на български и има title и description', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('bg');
    expect(document.title).not.toBe('');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
  });

  it('има точно един H1', () => {
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });
});

describe('лента за контакт (CallBar)', () => {
  it('има „Обади се“, Viber и WhatsApp в този ред', () => {
    expect(hrefs('nav[aria-label="Бърз контакт"]')).toEqual([contact.tel, contact.viber, contact.whatsapp]);
  });

  it('всеки бутон праща събитие към аналитиката', () => {
    const events = [...document.querySelectorAll('nav[aria-label="Бърз контакт"] a')].map((a) =>
      a.getAttribute('data-umami-event'),
    );
    expect(events).toEqual(['call_click', 'viber_click', 'whatsapp_click']);
  });
});

describe('горна лента (Header)', () => {
  it('менюто съдържа всички услуги, Цени, За нас и Контакти', () => {
    const links = hrefs('header nav[aria-label="Основно меню"]');
    for (const s of services) expect(links).toContain(`/uslugi/${s.slug}`);
    expect(links).toEqual(expect.arrayContaining(['/uslugi', '/ceni', '/za-nas', '/kontakti']));
  });

  it('има бутон „Обади се“ с tel: линк', () => {
    expect(hrefs('header')).toContain(contact.tel);
  });

  it('бутоните за меню сочат към съществуващи скрити панели', () => {
    const toggles = [...document.querySelectorAll('[data-toggle]')];
    expect(toggles.length).toBe(2);
    for (const button of toggles) {
      expect(button.getAttribute('aria-expanded')).toBe('false');
      const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
      expect(panel).not.toBeNull();
      expect(panel?.hasAttribute('hidden')).toBe(true);
    }
  });
});

describe('футър', () => {
  it('показва фирмените данни от site.ts', () => {
    const text = document.querySelector('footer')?.textContent ?? '';
    for (const value of [site.legalName, site.registeredAddress, site.businessAddress, site.eik, site.hours]) {
      expect(text).toContain(value);
    }
  });

  it('между етикета и стойността има интервал', () => {
    const text = document.querySelector('footer')?.textContent ?? '';
    expect(text).toContain(`ЕИК: ${site.eik}`);
  });

  it('има линк към политиката за поверителност', () => {
    expect(hrefs('footer')).toContain('/poveritelnost');
  });
});
