# hamal

Сайт за хамалски услуги — Astro, статичен. Заданието е в `SPEC.md`, правилата за работа — в `CLAUDE.md`.

## Локално

```sh
npm install
npm run dev      # http://localhost:4321
npm test               # тестове
npm run build          # проверка на типовете и build в dist/
npm run verify         # build + всички тестове, вкл. проверка на готовия сайт в dist/
npm run release-check  # като verify + няма TODO и домейнът не е примерният
```

Фирмените данни, цените и снимките са в `src/data/`.

## Статистика (Umami)

Без бисквитки, затова и без банер. На https://cloud.umami.is добавете сайта (Settings → Websites → Add website)
и сложете Website ID в `PUBLIC_UMAMI_WEBSITE_ID` (локално в `.env`, в Render — в Environment). Без него скриптът не се зарежда.
Събития: `call_click`, `viber_click`, `whatsapp_click`, `calculator_used`.

## Render (Static Site)

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Node: версията от `.node-version`

## Преди публикуване (т. 13 от SPEC.md)

Автоматично — `npm run release-check` трябва да мине без грешки. Той проверява build-а, калкулатора
(същите цени като ценоразписа), всички страници и линкове, SEO, JSON-LD, sitemap и че няма TODO.

Ръчно:

1. Данните от клиента в `src/data/` (фирма, домейн в `site.ts → url` — сега е временно адресът от Render, цени — сега са примерни, услуги, снимки, отзиви).
2. Политиката за поверителност — преглед от юрист или счетоводител, после махнете TODO в `src/pages/poveritelnost.astro`.
3. В Render → Environment: `PUBLIC_UMAMI_WEBSITE_ID` (по желание), после Manual Deploy.
4. Домейнът: Render → Settings → Custom Domains.
5. От истински Android и iPhone: „Обади се“, Viber и WhatsApp — и от лентата долу, и от бутоните в страниците.
6. „Прати сметката в WhatsApp“ от калкулатора — отваря чат с бат Миро с готово съобщение.
7. https://validator.schema.org с адреса на сайта — 0 грешки.
8. Lighthouse (телефон) — 90+ за Performance, SEO и Accessibility.
