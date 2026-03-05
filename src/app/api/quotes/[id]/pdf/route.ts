import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteLineItems, customers, shops } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.shopId, shopId)))
    .limit(1);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const lineItems = await db
    .select()
    .from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, id))
    .orderBy(quoteLineItems.sortOrder);

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  let customer = null;
  if (quote.customerId) {
    const [c] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, quote.customerId))
      .limit(1);
    customer = c ?? null;
  }

  // Return JSON data for client-side PDF rendering
  return NextResponse.json({
    quote,
    lineItems,
    shop,
    customer,
  });
}
