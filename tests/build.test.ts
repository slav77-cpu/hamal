// Проверка на готовия сайт в dist/ — точно това, което Render публикува (т. 13).
// Пуска се с `npm run verify` (build + всички тестове). Ако dist/ липсва, тестовете се пропускат.
// С RELEASE=1 (`npm run release-check`) проверява и че няма останали TODO преди публикуване.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { services } from '../src/data/services';
import { site } from '../src/data/site';

const DIST = new URL('../dist/', import.meta.url).pathname;
const built = existsSync(join(DIST, 'index.html'));

const pages = [
  '/',
  '/uslugi',
  ...services.map((s) => `/uslugi/${s.slug}`),
  '/ceni',
  '/za-nas',
  '/kontakti',
  '/poveritelnost',
  '/blagodarim',
];

const fileOf = (path: string) => join(DIST, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`);
const doc = (path: string) => parseHTML(readFileSync(fileOf(path), 'utf8')).document;

/** Размери на JPEG от заглавната му част (SOF маркер) */
function jpegSize(file: string) {
  const b = readFileSync(file);
  let i = 2;
  while (i < b.length) {
    const marker = b[i + 1];
    const length = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  return null;
}

describe.skipIf(!built)('готовият сайт (dist/)', () => {
  it('всички 12 страници са build-нати', () => {
    for (const path of pages) expect(existsSync(fileOf(path)), path).toBe(true);
  });

  describe.each(pages)('%s', (path) => {
    it('lang="bg", title, description, canonical', () => {
      const d = doc(path);
      expect(d.documentElement.getAttribute('lang')).toBe('bg');
      expect(d.title).toBeTruthy();
      expect(d.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
      expect(d.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(new URL(path, site.url).href);
    });

    it('снимката за споделяне е JPEG 1200×630 и съществува', () => {
      const url = doc(path).querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
      const file = join(DIST, new URL(url).pathname);
      expect(existsSync(file), url).toBe(true);
      expect(jpegSize(file)).toEqual({ width: 1200, height: 630 });
    });

    it('JSON-LD е валиден JSON с MovingCompany', () => {
      const ld = doc(path).querySelector('script[type="application/ld+json"]')?.textContent ?? '';
      expect(JSON.parse(ld)['@type']).toBe('MovingCompany');
    });

    it('всички снимки имат alt и размери; под първия екран се зареждат отложено', () => {
      const imgs = [...doc(path).querySelectorAll('main img')];
      imgs.forEach((img, i) => {
        expect(img.getAttribute('alt'), img.getAttribute('src') ?? '').toBeTruthy();
        expect(img.getAttribute('width')).toBeTruthy();
        expect(img.getAttribute('height')).toBeTruthy();
        if (i > 0) expect(img.getAttribute('loading')).toBe('lazy');
      });
    });

    it('вътрешните линкове и файловете съществуват', () => {
      const d = doc(path);
      const refs = [
        ...[...d.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')!),
        ...[...d.querySelectorAll('img[src^="/"], source[srcset^="/"]')].flatMap((el) =>
          (el.getAttribute('src') ?? el.getAttribute('srcset') ?? '').split(',').map((s) => s.trim().split(' ')[0]),
        ),
        ...[...d.querySelectorAll('link[href^="/"], script[src^="/"]')].map(
          (el) => el.getAttribute('href') ?? el.getAttribute('src')!,
        ),
      ];
      for (const ref of refs) {
        const clean = decodeURI(ref.split('#')[0].split('?')[0]);
        const file = clean === '/' ? fileOf('/') : existsSync(join(DIST, clean)) && statSync(join(DIST, clean)).isFile()
          ? join(DIST, clean)
          : fileOf(clean);
        expect(existsSync(file), `${ref} на ${path}`).toBe(true);
      }
    });

    it('без бисквитки и без външни скриптове, iframe или Google Maps', () => {
      const d = doc(path);
      expect(d.querySelector('iframe')).toBeNull();
      for (const script of d.querySelectorAll('script[src]')) {
        const src = script.getAttribute('src')!;
        expect(src.startsWith('/') || src === 'https://cloud.umami.is/script.js', src).toBe(true);
      }
      expect(d.documentElement.outerHTML).not.toMatch(/googletagmanager|google-analytics|maps\.google\.com\/maps\/embed|document\.cookie/);
    });

    it('Preact само за калкулатора и формата', () => {
      const islands = [...doc(path).querySelectorAll('astro-island')].map((el) => el.getAttribute('component-url') ?? '');
      for (const url of islands) expect(url).toMatch(/\/(Calculator|QuoteForm)\.[\w-]+\.js$/);
    });
  });

  it('sitemap: 11-те публични страници, без /blagodarim, без наклонена черта в края', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const expected = pages.filter((p) => p !== '/blagodarim').map((p) => new URL(p, site.url).href).sort();
    expect(urls).toEqual(expected);
  });

  it('robots.txt сочи към sitemap', () => {
    expect(readFileSync(join(DIST, 'robots.txt'), 'utf8')).toContain(`Sitemap: ${site.url}/sitemap-index.xml`);
  });

  it('един уеб шрифт (Onest)', () => {
    const fonts = readdirSync(join(DIST, '_astro')).filter((f) => f.endsWith('.woff2'));
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) expect(font).toMatch(/^onest-/);
  });
});

describe.runIf(process.env.RELEASE)('преди публикуване (RELEASE=1)', () => {
  it('в src/ няма TODO — всички данни от клиента са попълнени', () => {
    let out = '';
    try {
      out = execSync('grep -rn "TODO" src/', { encoding: 'utf8' });
    } catch {
      out = ''; // grep връща код 1, когато няма съвпадения
    }
    expect(out, `Останали TODO:\n${out}`).toBe('');
  });

  it('домейнът в site.ts не е примерният', () => {
    expect(site.url).not.toBe('https://example.com');
  });
});
