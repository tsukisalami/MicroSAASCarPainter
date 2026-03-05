import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, quotes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";

// GET /api/customers — list all customers for shop
export async function GET() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCustomers = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      createdAt: customers.createdAt,
      quoteCount: sql<number>`count(${quotes.id})::int`,
      totalValue: sql<string>`coalesce(sum(${quotes.total}::numeric), 0)::text`,
    })
    .from(customers)
    .leftJoin(quotes, eq(quotes.customerId, customers.id))
    .where(eq(customers.shopId, shopId))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

  return NextResponse.json(allCustomers);
}
