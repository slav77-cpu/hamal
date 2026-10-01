# hamal

Сайт за хамалски услуги — Astro, статичен. Заданието е в `SPEC.md`, правилата за работа — в `CLAUDE.md`.

## Локално

```sh
npm install
npm run dev      # http://localhost:4321
npm test         # тестове
npm run build    # проверка на типовете и build в dist/
```

Фирмените данни, цените и снимките са в `src/data/`.

## Форма за запитване (Web3Forms)

1. На https://web3forms.com въведете имейла, на който да идват запитванията, и вземете ключ (Access Key).
2. Локално: копирайте `.env.example` като `.env` и попълнете `PUBLIC_WEB3FORMS_KEY`, после рестартирайте `npm run dev`.
3. В Render: Settings → Environment → `PUBLIC_WEB3FORMS_KEY`, после Manual Deploy.

Без ключ формата показва „Формата още не е свързана“ и телефона.

## Статистика (Umami)

Без бисквитки, затова и без банер. На https://cloud.umami.is добавете сайта (Settings → Websites → Add website)
и сложете Website ID в `PUBLIC_UMAMI_WEBSITE_ID` (локално в `.env`, в Render — в Environment). Без него скриптът не се зарежда.
Събития: `call_click`, `viber_click`, `whatsapp_click`, `calculator_used`, `form_submit`.

## Render (Static Site)

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Node: версията от `.node-version`
