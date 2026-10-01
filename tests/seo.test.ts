// SEO и аналитика (т. 9 и т. 11): canonical, Open Graph, JSON-LD, robots.txt, Umami.
import { parseHTML } from 'linkedom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import IndexPage from '../src/pages/index.astro';
import ServicePage from '../src/pages/uslugi/[slug].astro';
import BlagodarimPage from '../src/pages/blagodarim.astro';
import { GET as robots } from '../src/pages/robots.txt';
import { services } from '../src/data/services';
import { site } from '../src/data/site';
import { movingCompanySchema, toJsonLd } from '../src/lib/schema';
import { createContainer } from './container';

type Container = Awaited<ReturnType<typeof createContainer>>;
let container: Container;

beforeAll(async () => {
  container = await createContainer();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function render(component: Parameters<Container['renderToString']>[0], path: string, props?: Record<string, unknown>) {
  const html = await container.renderToString(component, {
    request: new Request(`https://example.com${path}`),
    params: props ? { slug: path.split('/').pop() } : undefined,
    props,
  });
  return parseHTML(html).document;
}

const meta = (doc: Document, selector: string) => doc.querySelector(selector)?.getAttribute('content');

describe('head на страниците', () => {
  const service = services[0];
  const cases = [
    { path: '/', load: () => render(IndexPage, '/') },
    { path: `/uslugi/${service.slug}`, load: () => render(ServicePage, `/uslugi/${service.slug}`, { service }) },
  ];

  it.each(cases)('$path: canonical без наклонена черта в края и Open Graph', async ({ path, load }) => {
    const doc = await load();
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toBe(path === '/' ? `${site.url}/` : `${site.url}${path}`);
    expect(meta(doc, 'meta[property="og:url"]')).toBe(canonical);
    expect(meta(doc, 'meta[property="og:title"]')).toBe(doc.title);
    expect(meta(doc, 'meta[property="og:description"]')).toBe(meta(doc, 'meta[name="description"]'));
    expect(meta(doc, 'meta[property="og:locale"]')).toBe('bg_BG');
    // Пълен адрес; самият файл (.jpg, 1200×630) се проверява в build.test.ts
    expect(meta(doc, 'meta[property="og:image"]')).toMatch(new RegExp(`^${site.url}/.+`));
    expect(meta(doc, 'meta[property="og:image:width"]')).toBe('1200');
    expect(meta(doc, 'meta[property="og:image:height"]')).toBe('630');
  });

  it('JSON-LD MovingCompany с данните от site.ts', async () => {
    const doc = await render(IndexPage, '/');
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const data = JSON.parse(scripts[0].textContent ?? '');
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'MovingCompany',
      name: site.name,
      url: site.url,
      telephone: site.phone,
      address: { '@type': 'PostalAddress', streetAddress: site.businessAddress, addressLocality: site.city },
      areaServed: [...site.areas],
    });
  });

  it('JSON-LD на фирмата е една и съща на всяка страница (снимката — на екипа)', async () => {
    const ld = async (doc: Document) => doc.querySelector('script[type="application/ld+json"]')?.textContent;
    const home = await render(IndexPage, '/');
    const svc = await render(ServicePage, `/uslugi/${service.slug}`, { service });
    expect(await ld(svc)).toBe(await ld(home));
    expect(meta(svc, 'meta[property="og:image"]')).not.toBe(meta(home, 'meta[property="og:image"]'));
  });

  it('/blagodarim е noindex', async () => {
    const doc = await render(BlagodarimPage, '/blagodarim');
    expect(meta(doc, 'meta[name="robots"]')).toBe('noindex');
  });
});

describe('movingCompanySchema', () => {
  it('без работно време — без openingHours', () => {
    const data = movingCompanySchema();
    expect('openingHours' in JSON.parse(JSON.stringify(data))).toBe(site.hoursSchema.length > 0);
  });

  it('„<“ не може да затвори <script>', () => {
    expect(toJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('robots.txt', () => {
  it('позволява всичко и сочи към sitemap на домейна от site.ts', async () => {
    const response = await robots({} as Parameters<typeof robots>[0]);
    expect(await response.text()).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap-index.xml\n`);
  });
});

describe('Umami', () => {
  it('без PUBLIC_UMAMI_WEBSITE_ID няма скрипт', async () => {
    vi.stubEnv('PUBLIC_UMAMI_WEBSITE_ID', '');
    const doc = await render(IndexPage, '/');
    expect(doc.querySelector('script[data-website-id]')).toBeNull();
  });

  it('с PUBLIC_UMAMI_WEBSITE_ID — скриптът на Umami Cloud, отложен', async () => {
    vi.stubEnv('PUBLIC_UMAMI_WEBSITE_ID', 'test-id');
    const doc = await render(IndexPage, '/');
    const script = doc.querySelector('script[data-website-id]');
    expect(script?.getAttribute('data-website-id')).toBe('test-id');
    expect(script?.getAttribute('src')).toBe('https://cloud.umami.is/script.js');
    expect(script?.hasAttribute('defer')).toBe(true);
  });

  it('бутоните за контакт пращат call_click, viber_click, whatsapp_click', async () => {
    const doc = await render(IndexPage, '/');
    const events = new Set([...doc.querySelectorAll('[data-umami-event]')].map((el) => el.getAttribute('data-umami-event')));
    expect([...events].sort()).toEqual(['call_click', 'viber_click', 'whatsapp_click']);
  });
});
