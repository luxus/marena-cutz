import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─── Shared sub-schemas ────────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string(),
  duration: z.string().optional().default(''),
  price: z.string(),
  featured: z.boolean().optional().default(false),
});

const socialItemSchema = z.object({
  platform: z.string(),
  imageUrl: z.string(),
  permalink: z.string(),
  alt: z.string(),
  objectPosition: z.string().optional().default('center'),
  featured: z.boolean().optional().default(false),
});

const openingHourSchema = z.object({
  day: z.string(),
  hours: z.string(),
});

const paymentMethodSchema = z.object({
  name: z.string(),
  enabled: z.boolean().optional().default(true),
});

// ─── Collections ──────────────────────────────────────────────────────────

const barbers = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/barbers' }),
  schema: z.object({
    name: z.string(),
    position: z.string().optional().default(''),
    image: z.string().optional().default(''),
    about: z.string().optional().default(''),
    order: z.number().optional().default(0),
    services: z.array(serviceSchema).optional().default([]),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: 'settings.md', base: './src/content' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string().optional().default(''),
    owner: z.string().optional().default(''),
    address: z.string().optional().default(''),
    zipCity: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    email: z.string().optional().default(''),
    bookingUrl: z.string().optional().default(''),
    instagramUrl: z.string().optional().default(''),
    tiktokUrl: z.string().optional().default(''),
    mapsUrl: z.string().optional().default(''),
    metaDescription: z.string().optional().default(''),
    ogDescription: z.string().optional().default(''),
    ogImageAlt: z.string().optional().default(''),
    twitterDescription: z.string().optional().default(''),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: 'home.md', base: './src/content' }),
  schema: z.object({
    eyebrow: z.string().optional().default(''),
    headline: z.string().optional().default(''),
    text: z.string().optional().default(''),
    socialItems: z.array(socialItemSchema).optional().default([]),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({
    title: z.string().optional().default(''),
    text: z.string().optional().default(''),
    openingHours: z.array(openingHourSchema).optional().default([]),
    paymentMethods: z.array(paymentMethodSchema).optional().default([]),
  }),
});

const booking = defineCollection({
  loader: glob({ pattern: 'booking.md', base: './src/content' }),
  schema: z.object({
    title: z.string().optional().default(''),
    paymentNote: z.string().optional().default(''),
    availabilityTitle: z.string().optional().default(''),
    availabilityText: z.string().optional().default(''),
    walkInsTitle: z.string().optional().default(''),
    walkInsText: z.string().optional().default(''),
    cancellationTitle: z.string().optional().default(''),
    cancellationText: z.string().optional().default(''),
    latenessTitle: z.string().optional().default(''),
    latenessText: z.string().optional().default(''),
    ctaLabel: z.string().optional().default(''),
    cancelLabel: z.string().optional().default(''),
  }),
});

const parking = defineCollection({
  loader: glob({ pattern: 'parking.md', base: './src/content' }),
  schema: z.object({
    title: z.string().optional().default(''),
    image: z.string().optional().default(''),
    entrance: z.string().optional().default(''),
    parking: z.string().optional().default(''),
    transit: z.string().optional().default(''),
    mapsUrl: z.string().optional().default(''),
  }),
});

const prices = defineCollection({
  loader: glob({ pattern: 'prices.md', base: './src/content' }),
  schema: z.object({
    title: z.string().optional().default(''),
  }),
});

const impressum = defineCollection({
  loader: glob({ pattern: 'impressum.md', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    body: z.string().optional().default(''),
  }),
});

const datenschutz = defineCollection({
  loader: glob({ pattern: 'datenschutz.md', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    body: z.string().optional().default(''),
  }),
});

export const collections = {
  barbers,
  settings,
  home,
  about,
  booking,
  parking,
  prices,
  impressum,
  datenschutz,
};
