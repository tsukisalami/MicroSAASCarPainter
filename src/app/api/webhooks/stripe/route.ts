import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const shopId = session.metadata?.shopId;
      const plan = session.metadata?.plan as "pro" | "shop";
      if (shopId && plan) {
        await db
          .update(shops)
          .set({
            subscriptionTier: plan,
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            updatedAt: new Date(),
          })
          .where(eq(shops.id, shopId));
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const [shop] = await db
        .select()
        .from(shops)
        .where(eq(shops.stripeCustomerId, customerId))
        .limit(1);

      if (shop) {
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";
        await db
          .update(shops)
          .set({
            subscriptionTier: isActive ? shop.subscriptionTier : "free",
            stripeSubscriptionId: subscription.id,
            updatedAt: new Date(),
          })
          .where(eq(shops.id, shop.id));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await db
        .update(shops)
        .set({
          subscriptionTier: "free",
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(shops.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
