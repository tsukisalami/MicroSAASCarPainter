import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, id))
    .limit(1);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.status === "approved" || quote.status === "rejected") {
    return NextResponse.json(
      { error: "Quote already responded to" },
      { status: 400 }
    );
  }

  await db
    .update(quotes)
    .set({
      status: body.status,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, id));

  return NextResponse.json({ success: true });
}
