import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, quoteLineItems, customers, shops } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";
import { calculateQuote } from "@/lib/quote-calculator";
import { generateQuoteNumber } from "@/lib/utils";
import { checkQuoteLimit } from "@/lib/usage";
import { z } from "zod";

const createQuoteSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  vehicleYear: z.coerce.number().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleColor: z.string().optional(),
  serviceType: z.string(),
  paintColor: z.string().optional(),
  paintBrand: z.string().optional(),
  finishType: z.string(),
  panels: z.array(z.string()),
  notes: z.string().optional(),
  hourlyRate: z.number(),
  materialMarkup: z.number(),
  taxRate: z.number(),
});

// GET /api/quotes — list quotes for shop
export async function GET() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allQuotes = await db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      status: quotes.status,
      vehicleYear: quotes.vehicleYear,
      vehicleMake: quotes.vehicleMake,
      vehicleModel: quotes.vehicleModel,
      serviceType: quotes.serviceType,
      total: quotes.total,
      createdAt: quotes.createdAt,
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(quotes)
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.shopId, shopId))
    .orderBy(desc(quotes.createdAt));

  return NextResponse.json(allQuotes);
}

// POST /api/quotes — create a new quote
export async function POST(req: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await checkQuoteLimit(shopId);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `You've reached your monthly limit of ${usage.limit} quotes on the ${usage.plan} plan. Upgrade to create more.`,
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = createQuoteSchema.parse(body);

    // Upsert customer
    let customerId: string | null = null;
    if (data.customerName) {
      const [existing] = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.shopId, shopId),
            eq(customers.name, data.customerName)
          )
        )
        .limit(1);

      if (existing) {
        customerId = existing.id;
        // Update contact info if provided
        if (data.customerEmail || data.customerPhone) {
          await db
            .update(customers)
            .set({
              ...(data.customerEmail ? { email: data.customerEmail } : {}),
              ...(data.customerPhone ? { phone: data.customerPhone } : {}),
              updatedAt: new Date(),
            })
            .where(eq(customers.id, existing.id));
        }
      } else {
        const [newCustomer] = await db
          .insert(customers)
          .values({
            shopId,
            name: data.customerName,
            email: data.customerEmail || null,
            phone: data.customerPhone || null,
          })
          .returning();
        customerId = newCustomer.id;
      }
    }

    const calc = calculateQuote({
      serviceType: data.serviceType,
      finishType: data.finishType,
      panels: data.panels,
      hourlyRate: data.hourlyRate,
      materialMarkup: data.materialMarkup,
      taxRate: data.taxRate,
    });

    const [quote] = await db
      .insert(quotes)
      .values({
        shopId,
        customerId,
        quoteNumber: generateQuoteNumber(),
        status: "draft",
        vehicleYear: data.vehicleYear,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleColor: data.vehicleColor,
        serviceType: data.serviceType as typeof quotes.serviceType.enumValues[number],
        paintColor: data.paintColor,
        paintBrand: data.paintBrand,
        finishType: data.finishType as typeof quotes.finishType.enumValues[number],
        panels: JSON.stringify(data.panels),
        laborHours: String(calc.laborHours),
        laborTotal: String(calc.laborTotal),
        materialsTotal: String(calc.materialsTotal),
        subtotal: String(calc.subtotal),
        taxAmount: String(calc.taxAmount),
        total: String(calc.total),
        notes: data.notes,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();

    // Insert line items
    if (calc.lineItems.length > 0) {
      await db.insert(quoteLineItems).values(
        calc.lineItems.map((item, i) => ({
          quoteId: quote.id,
          description: item.description,
          category: item.category,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          total: String(item.total),
          isLabor: item.isLabor,
          sortOrder: i,
        }))
      );
    }

    await db
      .update(shops)
      .set({ quotesThisMonth: sql`quotes_this_month + 1` })
      .where(eq(shops.id, shopId));

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    console.error("Create quote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
