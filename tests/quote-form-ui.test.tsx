// @vitest-environment happy-dom
// Формата така, както я ползва посетителят: попълва, изпраща, вижда грешка или отива на /blagodarim.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuoteForm from '../src/components/QuoteForm';
import { contact } from '../src/lib/links';
import { setQuote } from '../src/lib/quote';

const fetchMock = vi.fn();
const onSuccess = vi.fn();

beforeEach(() => {
  setQuote('');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  onSuccess.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const type = (label: RegExp, value: string) => fireEvent.input(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.submit(screen.getByRole('button', { name: /Изпрати запитване|Изпраща се/ }).closest('form')!);
const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('форма за запитване', () => {
  it('полетата от т. 8', () => {
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    expect(screen.getByLabelText(/^Име/)).toBeTruthy();
    expect(screen.getByLabelText(/^Телефон/).getAttribute('type')).toBe('tel');
    expect(screen.getByLabelText(/^Дата на преместване/).getAttribute('type')).toBe('date');
    for (const label of [/^Откъде/, /^Докъде/, /^Какво се мести/]) expect(screen.getByLabelText(label)).toBeTruthy();
  });

  it('honeypot на Web3Forms: скрита отметка botcheck', () => {
    const { container } = render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    const honeypot = container.querySelector('input[name="botcheck"]') as HTMLInputElement;
    expect(honeypot.type).toBe('checkbox');
    expect(honeypot.style.display).toBe('none');
    expect(honeypot.tabIndex).toBe(-1);
  });

  it('текст за съгласие и линк към политиката под бутона', () => {
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    expect(
      screen.getByText(/Изпращайки формата, приемате данните ви да се използват само за отговор на запитването\./),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Политика за поверителност' }).getAttribute('href')).toBe('/poveritelnost');
  });

  it('празна форма: грешки на български, нищо не се праща', () => {
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    submit();
    expect(screen.getByText('Напишете името си.')).toBeTruthy();
    expect(screen.getByText('Напишете телефон за връзка.')).toBeTruthy();
    expect(screen.getByLabelText(/^Име/).getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(screen.getByLabelText(/^Име/));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('грешката изчезва, щом полето се поправи', () => {
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    submit();
    type(/^Име/, 'Иван');
    expect(screen.queryByText('Напишете името си.')).toBeNull();
  });

  it('успех: праща към Web3Forms и отива на /blagodarim', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const track = vi.fn();
    window.umami = { track };
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    type(/^Име/, 'Иван');
    type(/^Телефон/, '088 123 4567');
    type(/^Откъде/, 'Лозенец');
    submit();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(sentBody()).toMatchObject({ access_key: 'test-key', Име: 'Иван', Телефон: '088 123 4567', Откъде: 'Лозенец' });
    expect(track).toHaveBeenCalledWith('form_submit', undefined);
    delete window.umami;
  });

  it('по подразбиране успехът води към /blagodarim', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    render(<QuoteForm accessKey="test-key" />);
    type(/^Име/, 'Иван');
    type(/^Телефон/, '0881234567');
    submit();
    await waitFor(() => expect(assign).toHaveBeenCalledWith('/blagodarim'));
  });

  it('грешка: ясно съобщение и телефонът', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: false }) });
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    type(/^Име/, 'Иван');
    type(/^Телефон/, '0881234567');
    submit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Не успяхме да изпратим запитването');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe(contact.tel);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('без ключ: „Формата още не е свързана“ и телефонът', async () => {
    render(<QuoteForm accessKey="" onSuccess={onSuccess} />);
    type(/^Име/, 'Иван');
    type(/^Телефон/, '0881234567');
    submit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Формата още не е свързана.');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe(contact.tel);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('резултатът от калкулатора отива в скритото поле — и когато е избран след зареждането', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const { container } = render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    expect(container.querySelector('input[name="Калкулатор"]')).toBeNull();
    act(() => setQuote('Двустаен; партер → партер; в града'));
    expect((container.querySelector('input[name="Калкулатор"]') as HTMLInputElement).value).toBe(
      'Двустаен; партер → партер; в града',
    );
    expect(screen.getByText(/От калкулатора:/)).toBeTruthy();
    type(/^Име/, 'Иван');
    type(/^Телефон/, '0881234567');
    submit();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(sentBody().Калкулатор).toBe('Двустаен; партер → партер; в града');
  });

  it('избор от калкулатора преди формата да се зареди', () => {
    setQuote('Офис; минимална поръчка');
    render(<QuoteForm accessKey="test-key" onSuccess={onSuccess} />);
    expect(screen.getByText(/Офис; минимална поръчка/)).toBeTruthy();
  });
});
