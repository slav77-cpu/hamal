// Калкулатор за ориентировъчна цена (т. 7). Цените идват от pricing.ts, формулата — от lib/estimate.ts.
// Резултатът се смята при всяка промяна; „Изпрати запитване“ подава избора към формата под калкулатора.

import { useRef, useState } from 'preact/hooks';
import { pricing as defaultPricing, type ExtraKey, type Pricing } from '../data/pricing';
import { site } from '../data/site';
import { track } from '../lib/analytics';
import { estimatePrice, type EstimateInput, type JobType } from '../lib/estimate';
import { formatHours, formatPrice, formatPriceRange } from '../lib/format';
import { contact } from '../lib/links';
import { describeQuote, jobLabel, setQuote } from '../lib/quote';

interface Props {
  pricing?: Pricing; // само за тестовете; на сайта е pricing.ts
}

const JOBS: JobType[] = ['studio', 'twoRoom', 'threeRoom', 'house', 'office', 'items'];
const MAX_FLOOR = 30;

const chip =
  'flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-line bg-surface px-3 py-2 text-center font-bold transition-colors hover:border-ink/40 has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-[3px] has-focus-visible:outline-offset-[3px] has-focus-visible:outline-[#2f7bff]';
const check =
  'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-line bg-surface px-4 py-2 font-semibold transition-colors hover:border-ink/40 has-checked:border-ink has-checked:bg-tint';
const legend = 'font-display text-2xl font-extrabold';

export default function Calculator({ pricing = defaultPricing }: Props) {
  const [job, setJob] = useState<JobType>('twoRoom');
  const [fromFloor, setFromFloor] = useState(0);
  const [fromElevator, setFromElevator] = useState(false);
  const [toFloor, setToFloor] = useState(0);
  const [toElevator, setToElevator] = useState(false);
  const [outOfTown, setOutOfTown] = useState(false);
  const [km, setKm] = useState('');
  const [extras, setExtras] = useState<ExtraKey[]>([]);
  const used = useRef(false);

  const input: EstimateInput = {
    job,
    fromFloor,
    fromElevator,
    toFloor,
    toElevator,
    km: outOfTown ? Math.max(0, Number.parseInt(km, 10) || 0) : 0,
    extras,
  };
  const estimate = estimatePrice(input, pricing);
  const isMove = job !== 'office' && job !== 'items';

  // Всяка промяна минава оттук: първата праща calculator_used към аналитиката
  const update =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      if (!used.current) {
        used.current = true;
        track('calculator_used');
      }
    };

  const toggleExtra = (key: ExtraKey) =>
    update(setExtras)(extras.includes(key) ? extras.filter((k) => k !== key) : [...extras, key]);

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <div class="space-y-8">
        <fieldset>
          <legend class={legend}>1. Какво местите?</legend>
          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {JOBS.map((key) => (
              <label key={key} class={chip}>
                <input
                  type="radio"
                  name="calc-job"
                  value={key}
                  checked={job === key}
                  onChange={() => update(setJob)(key)}
                  class="sr-only"
                />
                {jobLabel(key, pricing)}
              </label>
            ))}
          </div>
        </fieldset>

        {isMove && (
          <>
            <fieldset>
              <legend class={legend}>2. Етажи</legend>
              <div class="mt-3 grid gap-4 sm:grid-cols-2">
                <Address
                  id="calc-from"
                  title="Откъде"
                  floor={fromFloor}
                  elevator={fromElevator}
                  onFloor={update(setFromFloor)}
                  onElevator={update(setFromElevator)}
                />
                <Address
                  id="calc-to"
                  title="Докъде"
                  floor={toFloor}
                  elevator={toElevator}
                  onFloor={update(setToFloor)}
                  onElevator={update(setToElevator)}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend class={legend}>3. Къде</legend>
              <div class="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                <label class={chip}>
                  <input
                    type="radio"
                    name="calc-where"
                    checked={!outOfTown}
                    onChange={() => update(setOutOfTown)(false)}
                    class="sr-only"
                  />
                  В града
                </label>
                <label class={chip}>
                  <input
                    type="radio"
                    name="calc-where"
                    checked={outOfTown}
                    onChange={() => update(setOutOfTown)(true)}
                    class="sr-only"
                  />
                  Извън града
                </label>
              </div>
              {outOfTown && (
                <div class="mt-4">
                  <label for="calc-km" class="font-medium">
                    Колко километра извън града?
                  </label>
                  <div class="mt-2 flex items-center gap-2">
                    <input
                      id="calc-km"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={1000}
                      value={km}
                      onInput={(e) => update(setKm)(e.currentTarget.value)}
                      class="h-12 w-28 rounded-xl border-2 border-line px-3 text-lg bg-surface focus:border-ink"
                    />
                    <span class="text-muted">км</span>
                  </div>
                  {input.km === 0 && <p class="mt-2 text-sm text-muted">Въведете километрите, за да ги включим в цената.</p>}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend class={legend}>4. Допълнително</legend>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                {(Object.keys(pricing.extras) as ExtraKey[]).map((key) => (
                  <label key={key} class={check}>
                    <input
                      type="checkbox"
                      checked={extras.includes(key)}
                      onChange={() => toggleExtra(key)}
                      class="size-5 shrink-0 accent-ink"
                    />
                    {pricing.extras[key].label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}
      </div>

      <div class="rounded-[20px] bg-ink p-7 text-white shadow-[0_22px_48px_rgb(16_24_40/0.24)] lg:sticky lg:top-24">
        <div aria-live="polite" aria-atomic="true">
          {estimate.kind === 'range' && (
            <>
              <p class="text-[13px] font-extrabold tracking-[0.12em] text-white/70 uppercase">Ориентировъчна цена</p>
              <p class="mt-2 font-display text-[44px] leading-none font-black text-accent">
                {formatPriceRange(estimate.min, estimate.max)}
              </p>
            </>
          )}
          {estimate.kind === 'minOrder' && (
            <>
              <p class="text-[13px] font-extrabold tracking-[0.12em] text-white/70 uppercase">Минимална поръчка</p>
              <p class="mt-2 font-display text-[40px] leading-none font-black text-accent">
                {formatHours([estimate.hours, estimate.hours])} — {formatPrice(estimate.price)}
              </p>
              <p class="mt-3">Цената за {jobLabel(job, pricing).toLowerCase()} зависи от обема — обадете се или пратете снимки.</p>
            </>
          )}
          {estimate.kind === 'pending' && (
            <>
              <p class="font-display text-[32px] leading-tight font-black text-accent">Цените предстоят</p>
              <p class="mt-2">Обадете се — ще ви кажем цената по телефона.</p>
            </>
          )}
        </div>

        <p class="mt-4 text-sm text-white/78">
          Ориентировъчна цена. Точната зависи от багажа — обадете се или пратете снимки.
        </p>
        <p class="mt-1 text-sm text-white/78">{site.vatNote}</p>

        <div class="mt-6 grid gap-3">
          <a
            href={contact.tel}
            class="btn btn-primary text-lg"
            data-umami-event="call_click"
          >
            Обади се
          </a>
          <a
            href="#zapitvane"
            onClick={() => setQuote(describeQuote(input, estimate, pricing))}
            class="btn btn-ghost text-lg"
          >
            Изпрати запитване
          </a>
        </div>
      </div>
    </div>
  );
}

interface AddressProps {
  id: string;
  title: string;
  floor: number;
  elevator: boolean;
  onFloor: (floor: number) => void;
  onElevator: (elevator: boolean) => void;
}

function Address({ id, title, floor, elevator, onFloor, onElevator }: AddressProps) {
  const stepper = 'grid size-11 place-items-center rounded-xl border-2 border-line text-xl font-bold hover:border-ink/40 disabled:opacity-40';
  return (
    <div class="rounded-2xl border-2 border-line bg-surface p-4" role="group" aria-labelledby={`${id}-title`}>
      <div class="flex items-center justify-between gap-3">
        <span id={`${id}-title`} class="font-medium">
          {title}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class={stepper}
            aria-label={`${title}: етаж надолу`}
            disabled={floor <= 0}
            onClick={() => onFloor(floor - 1)}
          >
            −
          </button>
          <output class="w-20 text-center font-extrabold" aria-live="polite">
            {floor === 0 ? 'Партер' : `Етаж ${floor}`}
          </output>
          <button
            type="button"
            class={stepper}
            aria-label={`${title}: етаж нагоре`}
            disabled={floor >= MAX_FLOOR}
            onClick={() => onFloor(floor + 1)}
          >
            +
          </button>
        </div>
      </div>
      <label class="mt-3 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={elevator}
          onChange={(e) => onElevator(e.currentTarget.checked)}
          class="size-5 accent-ink"
        />
        Има асансьор
      </label>
    </div>
  );
}
