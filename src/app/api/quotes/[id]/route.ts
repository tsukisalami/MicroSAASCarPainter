import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteLineItems, customers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";

// GET /api/quotes/:id — get quote details
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

  let customer = null;
  if (quote.customerId) {
    const [c] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, quote.customerId))
      .limit(1);
    customer = c ?? null;
  }

  return NextResponse.json({ ...quote, lineItems, customer });
}

// PATCH /api/quotes/:id — update quote status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [existing] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.shopId, shopId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status) {
    updateData.status = body.status;
    if (body.status === "sent") updateData.sentAt = new Date();
    if (body.status === "approved" || body.status === "rejected")
      updateData.respondedAt = new Date();
  }

  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.internalNotes !== undefined)
    updateData.internalNotes = body.internalNotes;

  const [updated] = await db
    .update(quotes)
    .set(updateData)
    .where(eq(quotes.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/quotes/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.shopId, shopId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await db.delete(quotes).where(eq(quotes.id, id));

  return NextResponse.json({ success: true });
}
