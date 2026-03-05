import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function getShopId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({ shopId: users.shopId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user?.shopId ?? null;
}
