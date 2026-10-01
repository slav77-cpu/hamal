// JSON-LD за търсачките (т. 9): MovingCompany с данните от site.ts.

import { site } from '../data/site';

export function movingCompanySchema(imageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: site.name,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: imageUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.businessAddress,
      addressLocality: site.city,
      addressCountry: 'BG',
    },
    // Празно, докато клиентът не даде работното време — тогава полето не се показва
    openingHours: site.hoursSchema.length > 0 ? site.hoursSchema : undefined,
    areaServed: site.areas,
  };
}

/** JSON за <script type="application/ld+json"> — „<“ се escape-ва, за да не затвори тага */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
