export const CREDIT_PACKAGES = [
  {
    id: 'pack-5',
    name: '5 Credits',
    credits: 5,
    priceInCents: 499,
    stripePriceId: process.env.STRIPE_PRICE_5 ?? 'price_placeholder_5',
    popular: false,
  },
  {
    id: 'pack-15',
    name: '15 Credits',
    credits: 15,
    priceInCents: 1199,
    stripePriceId: process.env.STRIPE_PRICE_15 ?? 'price_placeholder_15',
    popular: true,
  },
  {
    id: 'pack-50',
    name: '50 Credits',
    credits: 50,
    priceInCents: 2999,
    stripePriceId: process.env.STRIPE_PRICE_50 ?? 'price_placeholder_50',
    popular: false,
  },
] as const

export type CreditPackageId = typeof CREDIT_PACKAGES[number]['id']
