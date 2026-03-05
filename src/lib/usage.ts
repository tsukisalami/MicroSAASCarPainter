import { db } from "@/lib/db";
import { shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanKey } from "@/lib/stripe";

export async function checkQuoteLimit(shopId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  if (!shop) return { allowed: false, used: 0, limit: 0, plan: "free" };

  const tier = (shop.subscriptionTier ?? "free") as PlanKey;
  const plan = PLANS[tier] ?? PLANS.free;

  // Reset counter if we're in a new month
  const now = new Date();
  const resetAt = shop.quotesResetAt ? new Date(shop.quotesResetAt) : null;
  const needsReset =
    !resetAt ||
    resetAt.getMonth() !== now.getMonth() ||
    resetAt.getFullYear() !== now.getFullYear();

  if (needsReset) {
    await db
      .update(shops)
      .set({ quotesThisMonth: 0, quotesResetAt: now })
      .where(eq(shops.id, shopId));
    return { allowed: true, used: 0, limit: plan.quotesPerMonth, plan: tier };
  }

  const used = shop.quotesThisMonth ?? 0;
  return {
    allowed: used < plan.quotesPerMonth,
    used,
    limit: plan.quotesPerMonth,
    plan: tier,
  };
}
