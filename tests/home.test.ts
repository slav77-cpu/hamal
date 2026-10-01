// Началната страница: секциите от т. 4 в правилния ред и данните от src/data.
import { createContainer } from './container';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';
import IndexPage from '../src/pages/index.astro';
import { contact } from '../src/lib/links';
import { faq } from '../src/data/faq';
import { reviews } from '../src/data/reviews';
import { services } from '../src/data/services';
import { site } from '../src/data/site';

let document: Document;
let main: Element;

beforeAll(async () => {
  const container = await createContainer();
  const html = await container.renderToString(IndexPage, {
    request: new Request('https://example.com/'),
  });
  document = parseHTML(html).document;
  main = document.querySelector('main')!;
});

const section = (id: string) => document.getElementById(id)!;
const hrefs = (el: Element) => [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));

describe('начална страница', () => {
  it('секциите са в реда от заданието', () => {
    const ids = [...main.querySelectorAll(':scope > section')].map((s) => s.id);
    expect(ids).toEqual([
      '', // първи екран
      'uslugi',
      'ceni',
      'kak-rabotim',
      'zashto-nas',
      'snimki',
      'otzivi',
      'rayoni',
      'vaprosi',
      'zapitvane',
    ]);
  });

  it('първи екран: H1 с града, цена на час, „Обади се“, Viber и снимка', () => {
    const hero = main.querySelector(':scope > section')!;
    expect(hero.querySelector('h1')?.textContent).toContain(`Хамалски услуги в ${site.city}`);
    expect(hero.textContent).toMatch(/от\s…\s€\/час/);
    expect(hrefs(hero)).toEqual(expect.arrayContaining([contact.tel, contact.viber]));
    expect(hero.textContent).toContain('Пратете снимки на багажа за точна цена');
    expect(hero.querySelector('img')?.getAttribute('loading')).toBe('eager');
  });

  it('услуги: карта с линк за всяка услуга', () => {
    const links = hrefs(section('uslugi'));
    for (const s of services) expect(links).toContain(`/uslugi/${s.slug}`);
  });

  it('цени накратко: 3–4 цени и бутон „Изчисли цена“ към калкулатора', () => {
    const tiles = section('ceni').querySelectorAll('ul > li');
    expect(tiles.length).toBeGreaterThanOrEqual(3);
    expect(tiles.length).toBeLessThanOrEqual(4);
    const calc = [...section('ceni').querySelectorAll('a')].find((a) => a.textContent?.includes('Изчисли цена'));
    expect(calc?.getAttribute('href')).toBe('/ceni#kalkulator');
    expect(section('ceni').textContent).toContain(site.vatNote);
  });

  it('как работим: 4 стъпки', () => {
    expect(section('kak-rabotim').querySelectorAll('ol > li')).toHaveLength(4);
  });

  it('защо нас: фактите от site.ts', () => {
    const text = section('zashto-nas').textContent;
    for (const fact of site.whyUs) expect(text).toContain(fact.title);
  });

  it('снимки: 6–9 снимки с alt, които се зареждат отложено', () => {
    const imgs = [...section('snimki').querySelectorAll('img')];
    expect(imgs.length).toBeGreaterThanOrEqual(6);
    expect(imgs.length).toBeLessThanOrEqual(9);
    for (const img of imgs) {
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('отзиви: всички от reviews.ts', () => {
    expect(section('otzivi').querySelectorAll('blockquote')).toHaveLength(reviews.length);
  });

  it('райони: всички от site.ts', () => {
    const text = section('rayoni').textContent;
    for (const area of site.areas) expect(text).toContain(area);
  });

  it('въпроси: всички от faq.ts', () => {
    expect(section('vaprosi').querySelectorAll('details')).toHaveLength(faq.length);
  });

  it('финален призив: „Обади се сега“ с трите начина за контакт', () => {
    const cta = section('zapitvane');
    expect(cta.querySelector('h2')?.textContent).toBe('Обади се сега');
    expect(hrefs(cta)).toEqual(expect.arrayContaining([contact.tel, contact.viber, contact.whatsapp]));
  });

  it('никъде не стои „0 €“, докато цените не са попълнени', () => {
    expect(main.textContent).not.toMatch(/(^|\D)0\s?€/);
  });

  it('заглавията вървят по ред: един H1, после H2 за всяка секция', () => {
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    for (const s of main.querySelectorAll(':scope > section[id]')) {
      expect(s.querySelector('h2')).not.toBeNull();
    }
  });
});
