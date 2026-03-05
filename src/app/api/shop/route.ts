import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getShopId } from "@/lib/auth-helpers";
import { z } from "zod";

const updateShopSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  hourlyRate: z.string().optional(),
  taxRate: z.string().optional(),
  materialMarkup: z.string().optional(),
  currency: z.string().optional(),
});

// GET /api/shop — get current shop profile
export async function GET() {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId))
    .limit(1);

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(shop);
}

// PATCH /api/shop — update shop profile
export async function PATCH(req: Request) {
  const shopId = await getShopId();
  if (!shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateShopSchema.parse(body);

    const [updated] = await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, shopId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    console.error("Update shop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
