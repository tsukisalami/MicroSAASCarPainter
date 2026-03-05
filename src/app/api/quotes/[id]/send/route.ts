import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, customers, shops } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";
import { sendQuoteEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export async function POST(
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

  if (!quote.customerId) {
    return NextResponse.json(
      { error: "No customer linked to this quote" },
      { status: 400 }
    );
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, quote.customerId))
    .limit(1);

  if (!customer?.email) {
    return NextResponse.json(
      { error: "Customer has no email address" },
      { status: 400 }
    );
  }

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const quoteUrl = `${baseUrl}/quote/${id}`;

  const vehicleInfo = [quote.vehicleYear, quote.vehicleMake, quote.vehicleModel]
    .filter(Boolean)
    .join(" ") || "vehicle";

  try {
    await sendQuoteEmail({
      to: customer.email,
      customerName: customer.name,
      shopName: shop?.name ?? "Auto Body Shop",
      quoteNumber: quote.quoteNumber,
      quoteTotal: formatCurrency(quote.total ?? "0"),
      vehicleInfo,
      quoteUrl,
      shopPhone: shop?.phone ?? undefined,
      shopEmail: shop?.email ?? undefined,
    });

    // Update status to "sent"
    await db
      .update(quotes)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(eq(quotes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Check Resend configuration." },
      { status: 500 }
    );
  }
}
