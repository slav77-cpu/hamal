// @vitest-environment happy-dom
// Калкулаторът така, както го ползва посетителят: избира, цъка, вижда цена.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Calculator from '../src/components/Calculator';
import { pricing } from '../src/data/pricing';
import { buildPackages } from '../src/lib/price-list';
import { getQuote, setQuote } from '../src/lib/quote';
import { samplePricing } from './sample-pricing';

const NBSP = ' ';
const norm = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ');
const result = () => norm(screen.getByText(/Ориентировъчна цена$|Минимална поръчка$|Цените предстоят/).parentElement?.textContent);

afterEach(cleanup);
beforeEach(() => setQuote(''));

const choose = (name: string) => fireEvent.click(screen.getByRole('radio', { name }));
const tick = (name: string) => fireEvent.click(screen.getByRole('checkbox', { name }));
// Всеки адрес е група със заглавие „Откъде“/„Докъде“ — така и екранният четец ги различава
const up = (title: string, times: number) => {
  for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name: `${title}: етаж нагоре` }));
};

describe('калкулатор с примерни цени', () => {
  beforeEach(() => render(<Calculator pricing={samplePricing} />));

  it('показва шестте типа от заданието', () => {
    const types = screen.getAllByRole('radio').slice(0, 6).map((r) => r.closest('label')?.textContent);
    expect(types).toEqual(['Гарсониера', 'Двустаен', 'Тристаен', 'Къща', 'Офис', 'Отделни вещи']);
  });

  it('двустаен, партер, в града: между 210 и 350 €', () => {
    expect(result()).toContain('между 210 и 350 €');
  });

  it('пълен пример от т. 7 → 300–445 €', () => {
    up('Откъде', 4);
    up('Докъде', 2);
    fireEvent.click(within(screen.getByRole('group', { name: 'Докъде' })).getByRole('checkbox', { name: 'Има асансьор' }));
    choose('Извън града');
    fireEvent.input(screen.getByLabelText('Колко километра извън града?'), { target: { value: '30' } });
    tick('Демонтаж и монтаж');
    tick('Опаковане');
    expect(result()).toContain('между 300 и 445 €');
  });

  it('етажът не пада под партер', () => {
    const down = screen.getByRole('button', { name: 'Откъде: етаж надолу' });
    expect(down).toHaveProperty('disabled', true);
    up('Откъде', 1);
    expect(screen.getAllByText('Етаж 1')).toHaveLength(1);
    fireEvent.click(down);
    expect(screen.getAllByText('Партер')).toHaveLength(2);
  });

  it('извън града без км — подсказва да се въведат', () => {
    choose('Извън града');
    expect(screen.getByText('Въведете километрите, за да ги включим в цената.')).toBeTruthy();
  });

  it.each(['Офис', 'Отделни вещи'])('%s: минималната поръчка, без въпросите за етажи', (type) => {
    choose(type);
    expect(result()).toContain(`2 часа — 110 €`);
    expect(screen.queryByText('2. Етажи')).toBeNull();
    expect(screen.queryByText('4. Допълнително')).toBeNull();
  });

  it('„Изпрати запитване“ води до формата и подава избора', () => {
    choose('Гарсониера');
    const link = screen.getByRole('link', { name: 'Изпрати запитване' });
    expect(link.getAttribute('href')).toBe('#zapitvane');
    fireEvent.click(link);
    expect(norm(getQuote())).toBe('Гарсониера; партер → партер; в града; ориентировъчно между 110 и 165 €');
  });

  it('има „Обади се“ и бележката под резултата', () => {
    expect(screen.getByRole('link', { name: 'Обади се' }).getAttribute('href')).toMatch(/^tel:\+359/);
    expect(screen.getByText('Ориентировъчна цена. Точната зависи от багажа — обадете се или пратете снимки.')).toBeTruthy();
  });
});

describe('т. 13: калкулаторът дава същите цени като ценоразписа', () => {
  const packages = buildPackages(samplePricing);

  it.each([
    ['Гарсониера', 0],
    ['Двустаен', 1],
    ['Тристаен', 2],
  ] as const)('%s', (type, index) => {
    render(<Calculator pricing={samplePricing} />);
    choose(type);
    const from = norm(packages[index].price).match(/\d+/)?.[0]; // „от 110 €“ в ценоразписа → 110
    expect(result()).toContain(`между ${from} и`);
  });
});

describe('калкулатор с истинските цени от pricing.ts', () => {
  it('докато цените са 0 — „Цените предстоят“ и бутон за обаждане', () => {
    const allZero = pricing.porterPerHour === 0;
    render(<Calculator />);
    if (allZero) {
      expect(screen.getByText('Цените предстоят')).toBeTruthy();
    } else {
      expect(result()).toMatch(/между \d+ и \d+ €/);
    }
    expect(within(document.body).getByRole('link', { name: 'Обади се' })).toBeTruthy();
  });
});

it('аналитиката: calculator_used веднъж, при първата промяна', () => {
  const track = vi.fn();
  window.umami = { track };
  render(<Calculator pricing={samplePricing} />);
  expect(track).not.toHaveBeenCalled();
  choose('Къща');
  choose('Тристаен');
  expect(track).toHaveBeenCalledTimes(1);
  expect(track).toHaveBeenCalledWith('calculator_used', undefined);
  delete window.umami;
  cleanup();
});

it(`цените в резултата са с неразделящ интервал преди €`, () => {
  render(<Calculator pricing={samplePricing} />);
  expect(screen.getByText(/между 210 и 350/).textContent).toContain(`350${NBSP}€`);
  cleanup();
});
