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

## Render (Static Site)

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Node: версията от `.node-version`
