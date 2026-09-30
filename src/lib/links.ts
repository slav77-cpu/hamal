// Линкове за контакт от номерата в site.ts (формат — т. 11 от заданието).
// Viber работи само с инсталирано приложение, затова номерът винаги се показва и като текст.

import { site } from '../data/site';
import { formatPhone } from './format';

/** Маха интервали, тирета и скоби: „+359 88 123-4567“ → „+359881234567“ */
const clean = (phone: string) => phone.replace(/[^\d+]/g, '');

/** tel:+359000000000 */
export const telHref = (phone: string) => `tel:${clean(phone)}`;

/** viber://chat?number=%2B359000000000 */
export const viberHref = (phone: string) =>
  `viber://chat?number=${encodeURIComponent(clean(phone))}`;

/** https://wa.me/359000000000 */
export const whatsappHref = (phone: string) => `https://wa.me/${clean(phone).replace(/^\+/, '')}`;

export const contact = {
  tel: telHref(site.phone),
  viber: viberHref(site.viber),
  whatsapp: whatsappHref(site.whatsapp),
  phoneText: formatPhone(site.phone),
  email: `mailto:${site.email}`,
} as const;
