import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  if (!shop?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: shop.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}
