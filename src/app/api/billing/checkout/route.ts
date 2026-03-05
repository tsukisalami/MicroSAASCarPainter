import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getShopId, getSessionUser } from "@/lib/auth-helpers";
import { getStripe, PLANS } from "@/lib/stripe";

export async function POST(req: Request) {
  const shopId = await getShopId();
  const user = await getSessionUser();
  if (!shopId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan = body.plan as "pro" | "shop";

  if (!PLANS[plan]?.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripe();

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  let customerId = shop?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: shop?.name ?? undefined,
      metadata: { shopId },
    });
    customerId = customer.id;
    await db
      .update(shops)
      .set({ stripeCustomerId: customerId })
      .where(eq(shops.id, shopId));
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PLANS[plan].priceId!, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/settings?billing=success`,
    cancel_url: `${baseUrl}/dashboard/settings?billing=cancelled`,
    metadata: { shopId, plan },
  });

  return NextResponse.json({ url: session.url });
}
