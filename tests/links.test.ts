import { describe, expect, it } from 'vitest';
import { contact, telHref, viberHref, whatsappHref } from '../src/lib/links';
import { site } from '../src/data/site';

// Форматите са от т. 11 от заданието
describe('линкове за контакт', () => {
  it('tel:', () => {
    expect(telHref('+359881234567')).toBe('tel:+359881234567');
    expect(telHref('+359 88 123-4567')).toBe('tel:+359881234567');
  });

  it('Viber кодира „+“ като %2B', () => {
    expect(viberHref('+359881234567')).toBe('viber://chat?number=%2B359881234567');
  });

  it('WhatsApp е без „+“', () => {
    expect(whatsappHref('+359881234567')).toBe('https://wa.me/359881234567');
  });

  it('ползва номерата от site.ts', () => {
    expect(contact.tel).toBe(telHref(site.phone));
    expect(contact.viber).toBe(viberHref(site.viber));
    expect(contact.whatsapp).toBe(whatsappHref(site.whatsapp));
  });
});
