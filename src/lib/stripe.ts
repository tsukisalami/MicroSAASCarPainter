import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    quotesPerMonth: 5,
    priceId: null,
    price: 0,
  },
  pro: {
    name: "Pro",
    quotesPerMonth: Infinity,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    price: 29,
  },
  shop: {
    name: "Shop",
    quotesPerMonth: Infinity,
    priceId: process.env.STRIPE_SHOP_PRICE_ID ?? null,
    price: 49,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
