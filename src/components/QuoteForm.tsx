// Форма за запитване (т. 8). Изпраща през Web3Forms; при успех — към /blagodarim,
// при грешка — съобщение и телефонът като алтернатива. Резултатът от калкулатора идва в скрито поле.

import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { track } from '../lib/analytics';
import { contact } from '../lib/links';
import { getQuote, onQuote } from '../lib/quote';
import {
  buildPayload,
  FIELD_NAMES,
  sendQuote,
  validateQuote,
  type QuoteErrors,
  type QuoteValues,
} from '../lib/quote-form';

interface Props {
  accessKey?: string; // на сайта — PUBLIC_WEB3FORMS_KEY; в тестовете — примерен
  onSuccess?: () => void; // на сайта — пренасочване към /blagodarim
}

type Status = 'idle' | 'sending' | 'failed' | 'no-key';

const EMPTY: QuoteValues = { name: '', phone: '', date: '', from: '', to: '', items: '' };

const pad = (n: number) => String(n).padStart(2, '0');
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const inputClass =
  'mt-1.5 block h-12 w-full rounded-xl border-2 border-line bg-white px-3 text-lg text-ink focus:border-ink focus:outline-none aria-invalid:border-red-600';

export default function QuoteForm({
  accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
  onSuccess = () => window.location.assign('/blagodarim'),
}: Props) {
  const [values, setValues] = useState<QuoteValues>(EMPTY);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [quote, setQuote] = useState('');
  const form = useRef<HTMLFormElement>(null);

  // Изборът от калкулатора — и ако е направен преди формата да се зареди
  useEffect(() => {
    setQuote(getQuote());
    const off = onQuote(setQuote);
    return () => {
      off();
    };
  }, []);

  const field = (key: keyof QuoteValues) => ({
    id: `quote-${key}`,
    name: FIELD_NAMES[key],
    value: values[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `quote-${key}-error` : undefined,
    onInput: (e: Event) => {
      const value = (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).value;
      setValues((v) => ({ ...v, [key]: value }));
      if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
    },
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validateQuote(values, localToday());
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      form.current?.querySelector<HTMLElement>(`#quote-${firstInvalid}`)?.focus();
      return;
    }

    const botcheck = (form.current?.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked ?? false;
    setStatus('sending');
    const result = await sendQuote(buildPayload(values, quote, accessKey, botcheck));
    if (result.ok) {
      track('form_submit');
      onSuccess();
      return;
    }
    setStatus(result.reason);
  }

  return (
    <form
      ref={form}
      action="https://api.web3forms.com/submit"
      method="post"
      noValidate
      onSubmit={submit}
      class="rounded-2xl border-2 border-line bg-white p-5 text-ink sm:p-6"
    >
      <input type="hidden" name="access_key" value={accessKey} />
      {/* Скрито поле срещу спам (honeypot на Web3Forms): хората не го виждат, ботовете го отмятат */}
      <input type="checkbox" name="botcheck" class="hidden" style="display: none;" tabIndex={-1} aria-hidden="true" />

      <div class="grid gap-4 sm:grid-cols-2">
        <Field id="quote-name" label="Име" error={errors.name}>
          <input {...field('name')} type="text" autoComplete="name" class={inputClass} />
        </Field>
        <Field id="quote-phone" label="Телефон" error={errors.phone}>
          <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" class={inputClass} />
        </Field>
        <Field id="quote-from" label="Откъде" optional hint="квартал или град">
          <input {...field('from')} type="text" class={inputClass} />
        </Field>
        <Field id="quote-to" label="Докъде" optional hint="квартал или град">
          <input {...field('to')} type="text" class={inputClass} />
        </Field>
        <Field id="quote-date" label="Дата на преместване" optional error={errors.date}>
          <input {...field('date')} type="date" class={inputClass} />
        </Field>
        <div class="sm:col-span-2">
          <Field id="quote-items" label="Какво се мести" optional>
            <textarea
              {...field('items')}
              rows={3}
              class={`${inputClass} h-auto py-2`}
            />
          </Field>
        </div>
      </div>

      {quote && (
        <p class="mt-4 rounded-xl bg-brand/25 p-3 text-sm">
          <strong>От калкулатора:</strong> {quote}
          <input type="hidden" name={FIELD_NAMES.quote} value={quote} />
        </p>
      )}

      {(status === 'failed' || status === 'no-key') && (
        <p role="alert" class="mt-4 rounded-xl border-2 border-red-600 bg-red-50 p-3 text-red-800">
          {status === 'no-key' ? 'Формата още не е свързана.' : 'Не успяхме да изпратим запитването. Опитайте отново'}{' '}
          {status === 'no-key' ? 'Обадете се' : 'или се обадете'} на{' '}
          <a href={contact.tel} class="font-semibold underline" data-umami-event="call_click">
            {contact.phoneText}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        class="mt-5 flex min-h-13 w-full items-center justify-center rounded-xl bg-brand px-5 text-lg font-semibold text-ink hover:bg-brand-hover disabled:opacity-60"
      >
        {status === 'sending' ? 'Изпраща се…' : 'Изпрати запитване'}
      </button>
      <p class="mt-3 text-sm text-muted">
        Изпращайки формата, приемате данните ви да се използват само за отговор на запитването.{' '}
        <a href="/poveritelnost" class="underline">
          Политика за поверителност
        </a>
      </p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ComponentChildren;
}

function Field({ id, label, optional, hint, error, children }: FieldProps) {
  return (
    <div>
      <label for={id} class="font-medium">
        {label}
        {optional && <span class="font-normal text-muted"> (по желание)</span>}
      </label>
      {children}
      {hint && !error && <p class="mt-1 text-sm text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} class="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
