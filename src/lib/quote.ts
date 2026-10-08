// Изборът в калкулатора като текст — за съобщението в WhatsApp („Прати сметката в WhatsApp“).

import { pricing as defaultPricing, type Pricing } from '../data/pricing';
import type { Estimate, EstimateInput } from './estimate';
import { formatFloor, formatPrice, formatPriceRange } from './format';

const JOB_LABELS = { office: 'Офис', items: 'Отделни вещи' } as const;

export function jobLabel(job: EstimateInput['job'], p: Pricing = defaultPricing): string {
  return job === 'office' || job === 'items' ? JOB_LABELS[job] : p.jobs[job].label;
}

const address = (floor: number, elevator: boolean) =>
  floor > 0 ? `${formatFloor(floor)} ${elevator ? 'с асансьор' : 'без асансьор'}` : formatFloor(floor);

/** „Двустаен; етаж 4 без асансьор → етаж 2 с асансьор; извън града, 30 км; Опаковане; между 300 и 445 €“ */
export function describeQuote(input: EstimateInput, estimate: Estimate, p: Pricing = defaultPricing): string {
  const parts: string[] = [jobLabel(input.job, p)];

  if (input.job !== 'office' && input.job !== 'items') {
    parts.push(`${address(input.fromFloor, input.fromElevator)} → ${address(input.toFloor, input.toElevator)}`);
    parts.push(input.km > 0 ? `извън града, ${input.km} км` : 'в града');
    if (input.extras.length) parts.push(input.extras.map((key) => p.extras[key].label).join(', '));
  }

  if (estimate.kind === 'range') parts.push(`ориентировъчно ${formatPriceRange(estimate.min, estimate.max)}`);
  if (estimate.kind === 'minOrder') parts.push(`минимална поръчка ${estimate.hours} ч — ${formatPrice(estimate.price)}`);

  return parts.join('; ');
}
