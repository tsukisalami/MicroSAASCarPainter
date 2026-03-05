import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes, customers } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";

export async function GET() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [stats] = await db
    .select({
      totalQuotes: sql<number>`count(${quotes.id})::int`,
      quotesThisMonth: sql<number>`count(case when ${quotes.createdAt} >= ${startOfMonth} then 1 end)::int`,
      approvedQuotes: sql<number>`count(case when ${quotes.status} = 'approved' then 1 end)::int`,
      sentQuotes: sql<number>`count(case when ${quotes.status} in ('sent','viewed','approved','rejected') then 1 end)::int`,
      totalRevenue: sql<string>`coalesce(sum(case when ${quotes.status} = 'approved' then ${quotes.total}::numeric else 0 end), 0)::text`,
      pipeline: sql<string>`coalesce(sum(case when ${quotes.status} in ('sent','viewed') then ${quotes.total}::numeric else 0 end), 0)::text`,
    })
    .from(quotes)
    .where(eq(quotes.shopId, shopId));

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(eq(customers.shopId, shopId));

  const recentQuotes = await db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      status: quotes.status,
      total: quotes.total,
      vehicleMake: quotes.vehicleMake,
      vehicleModel: quotes.vehicleModel,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(eq(quotes.shopId, shopId))
    .orderBy(sql`${quotes.createdAt} desc`)
    .limit(5);

  const conversionRate =
    stats.sentQuotes > 0
      ? Math.round((stats.approvedQuotes / stats.sentQuotes) * 100)
      : 0;

  return NextResponse.json({
    totalQuotes: stats.totalQuotes,
    quotesThisMonth: stats.quotesThisMonth,
    customerCount: customerCount.count,
    approvedRevenue: stats.totalRevenue,
    pipeline: stats.pipeline,
    conversionRate,
    recentQuotes,
  });
}
