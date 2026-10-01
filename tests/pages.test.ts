// Рендира всички страници и проверява общите правила: заглавия, линкове, noindex, цени.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';
import { services } from '../src/data/services';
import { site } from '../src/data/site';
import { contact } from '../src/lib/links';

const modules = import.meta.glob<{ default: AstroComponentFactory }>('../src/pages/**/*.astro', { eager: true });
const page = (file: string) => modules[`../src/pages/${file}`].default;

// Адрес → как се рендира
const routes: { path: string; component: AstroComponentFactory; props?: Record<string, unknown> }[] = [
  { path: '/', component: page('index.astro') },
  { path: '/uslugi', component: page('uslugi/index.astro') },
  ...services.map((service) => ({
    path: `/uslugi/${service.slug}`,
    component: page('uslugi/[slug].astro'),
    props: { service },
  })),
  { path: '/ceni', component: page('ceni.astro') },
  { path: '/za-nas', component: page('za-nas.astro') },
  { path: '/kontakti', component: page('kontakti.astro') },
  { path: '/poveritelnost', component: page('poveritelnost.astro') },
  { path: '/blagodarim', component: page('blagodarim.astro') },
];

const docs = new Map<string, Document>();

beforeAll(async () => {
  const container = await AstroContainer.create();
  for (const route of routes) {
    const html = await container.renderToString(route.component, {
      request: new Request(`https://example.com${route.path}`),
      params: route.path.startsWith('/uslugi/') ? { slug: route.path.split('/').pop() } : undefined,
      props: route.props,
    });
    docs.set(route.path, parseHTML(html).document);
  }
});

const doc = (path: string) => docs.get(path)!;

// Текстът, както се вижда на екрана: блоковите елементи са на отделни редове,
// а текстът и вътрешните елементи (a, span, strong) в един блок — на един ред.
const INLINE = new Set(['A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'SMALL', 'ABBR']);
function visibleText(node: Node): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (node.nodeType !== 1) return '';
  const el = node as Element;
  if (el.classList?.contains('sr-only') || ['SCRIPT', 'STYLE', 'SVG'].includes(el.tagName)) return '';
  const inner = [...el.childNodes].map(visibleText).join('');
  return INLINE.has(el.tagName) ? inner : `\n${inner}\n`;
}
const text = (path: string) => doc(path).querySelector('main')?.textContent ?? '';
const links = (path: string, scope = 'body') =>
  [...doc(path).querySelectorAll(`${scope} a[href]`)].map((a) => a.getAttribute('href')!);

it('всички страници от т. 3 съществуват', () => {
  expect(Object.keys(modules).sort()).toEqual([
    '../src/pages/blagodarim.astro',
    '../src/pages/ceni.astro',
    '../src/pages/index.astro',
    '../src/pages/kontakti.astro',
    '../src/pages/poveritelnost.astro',
    '../src/pages/uslugi/[slug].astro',
    '../src/pages/uslugi/index.astro',
    '../src/pages/za-nas.astro',
  ]);
});

describe.each(routes.map((r) => r.path))('%s', (path) => {
  it('има точно един H1', () => {
    expect(doc(path).querySelectorAll('h1')).toHaveLength(1);
  });

  it('има title и description', () => {
    expect(doc(path).title).toBeTruthy();
    expect(doc(path).querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
  });

  it('вътрешните линкове водят до съществуващи страници и котви', () => {
    for (const href of links(path)) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      const [target, hash] = href.startsWith('#') ? [path, href.slice(1)] : href.split('#');
      expect(docs.has(target), `${href} на ${path}`).toBe(true);
      if (hash) expect(doc(target).getElementById(hash), `${href} на ${path}`).not.toBeNull();
    }
  });

  it('лентата за контакт е там', () => {
    expect(links(path, 'nav[aria-label="Бърз контакт"]')).toEqual([contact.tel, contact.viber, contact.whatsapp]);
  });

  it('няма слепени думи (напр. „управление:[Седалище“)', () => {
    const lines = visibleText(doc(path).body).split('\n');
    expect(lines.filter((line) => /[\p{L}][:;,](?=[\p{L}[])|[\p{L}:,]\[/u.test(line))).toEqual([]);
  });

  it('не показва „0 €“ и няма вграден Google Maps', () => {
    expect(text(path)).not.toMatch(/(^|\D)0\s?€/);
    expect(doc(path).querySelector('iframe')).toBeNull();
  });
});

it('заглавията и описанията на страниците не се повтарят', () => {
  const titles = routes.map((r) => doc(r.path).title);
  const descriptions = routes.map((r) => doc(r.path).querySelector('meta[name="description"]')?.getAttribute('content'));
  expect(new Set(titles).size).toBe(titles.length);
  expect(new Set(descriptions).size).toBe(descriptions.length);
});

describe('страници за услуги', () => {
  it.each(services)('$slug: H1, цена, включено, въпроси, бутони', (service) => {
    const path = `/uslugi/${service.slug}`;
    expect(doc(path).querySelector('h1')?.textContent).toBe(`${service.title} в ${site.city}`);
    expect(text(path)).toMatch(/от\s…\s€/);
    for (const item of service.included) expect(text(path)).toContain(item);
    expect(doc(path).querySelectorAll('#vaprosi details')).toHaveLength(service.faq.length);
    const top = doc(path).querySelector('main > section')!;
    const topLinks = [...top.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(topLinks).toEqual(expect.arrayContaining([contact.tel, contact.viber]));
    expect(top.querySelector('img')).not.toBeNull();
  });

  it('текстът на всяка услуга е различен', () => {
    const bodies = services.map((s) => doc(`/uslugi/${s.slug}`).querySelector('#vklyucheno')?.textContent);
    expect(new Set(bodies).size).toBe(services.length);
  });
});

describe('/ceni', () => {
  it('ценоразпис с 8 реда и 4 пакета', () => {
    expect(doc('/ceni').querySelectorAll('#cenorazpis tbody tr')).toHaveLength(8);
    expect(doc('/ceni').querySelectorAll('#paketi li')).toHaveLength(4);
  });

  it('под всяка таблица: ориентировъчни цени и ДДС', () => {
    for (const id of ['cenorazpis', 'paketi']) {
      const section = doc('/ceni').getElementById(id)!.textContent;
      expect(section).toContain('Цените са ориентировъчни. Точна цена по телефона или след снимки във Viber.');
      expect(section).toContain(site.vatNote);
    }
  });

  it('калкулаторът и формата под него', () => {
    const ids = [...doc('/ceni').querySelectorAll('main > section')].map((s) => s.id);
    expect(ids.indexOf('zapitvane')).toBe(ids.indexOf('kalkulator') + 1);
  });
});

describe('/kontakti', () => {
  it('телефон, Viber, WhatsApp, имейл и място за формата', () => {
    expect(links('/kontakti', 'main')).toEqual(
      expect.arrayContaining([contact.tel, contact.viber, contact.whatsapp, contact.email]),
    );
    expect(doc('/kontakti').getElementById('zapitvane')).not.toBeNull();
  });

  it('картата е снимка, а не вграден Google Maps', () => {
    expect(doc('/kontakti').querySelector('#karta-title')?.parentElement?.querySelector('img')).not.toBeNull();
  });
});

describe('/poveritelnost', () => {
  it('казва кой, какво, защо, къде, колко време и какви права', () => {
    const t = text('/poveritelnost');
    for (const part of [site.legalName, site.eik, 'Web3Forms', site.dataRetention, 'бисквитки', 'Комисията за защита на личните данни']) {
      expect(t).toContain(part);
    }
  });
});

describe('/blagodarim', () => {
  it('е noindex, а другите страници не са', () => {
    for (const route of routes) {
      const robots = doc(route.path).querySelector('meta[name="robots"]')?.getAttribute('content');
      expect(robots).toBe(route.path === '/blagodarim' ? 'noindex' : undefined);
    }
  });

  it('текстът от заданието', () => {
    expect(text('/blagodarim')).toContain('Благодарим!');
    expect(text('/blagodarim')).toMatch(/Ще ви се обадим до … минути в работно време\./);
  });

  it('няма линк към нея от менюто или от други страници', () => {
    for (const route of routes) expect(links(route.path)).not.toContain('/blagodarim');
  });
});

describe('меню', () => {
  it('отбелязва текущата страница', () => {
    for (const path of ['/ceni', '/za-nas', '/kontakti']) {
      const current = doc(path).querySelector('header nav[aria-label="Основно меню"] a[aria-current="page"]');
      expect(current?.getAttribute('href')).toBe(path);
    }
  });
});
