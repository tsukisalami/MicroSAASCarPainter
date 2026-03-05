import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { quotes, quoteLineItems, customers, shops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { PaintBucket } from "lucide-react";
import { QuoteResponseButtons } from "./response-buttons";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, id))
    .limit(1);

  if (!quote) notFound();

  // Mark as viewed if currently "sent"
  if (quote.status === "sent") {
    await db
      .update(quotes)
      .set({ status: "viewed", viewedAt: new Date(), updatedAt: new Date() })
      .where(eq(quotes.id, id));
  }

  const lineItems = await db
    .select()
    .from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, id))
    .orderBy(quoteLineItems.sortOrder);

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, quote.shopId))
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

  const panels: string[] = quote.panels ? JSON.parse(quote.panels) : [];
  const isResponded = quote.status === "approved" || quote.status === "rejected";
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <PaintBucket className="h-5 w-5 text-primary" />
            <span className="font-bold">{shop?.name ?? "QuotePaint"}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Quote {quote.quoteNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Status banner */}
        {quote.status === "approved" && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center text-sm text-green-800">
            This quote has been approved. Thank you!
          </div>
        )}
        {quote.status === "rejected" && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-center text-sm text-red-800">
            This quote was declined.
          </div>
        )}
        {isExpired && !isResponded && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center text-sm text-yellow-800">
            This quote has expired. Please contact the shop for an updated estimate.
          </div>
        )}

        {/* Quote header */}
        <div className="mb-8 rounded-lg border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Paint Job Quote</h1>
              <p className="text-sm text-muted-foreground">
                {quote.quoteNumber} &middot; {new Date(quote.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatCurrency(quote.total ?? "0")}</p>
              {quote.validUntil && !isExpired && (
                <p className="text-xs text-muted-foreground">
                  Valid until {new Date(quote.validUntil).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle & Customer */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-5">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Prepared for
            </h2>
            <p className="font-medium">{customer?.name ?? "Customer"}</p>
            {customer?.email && (
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            )}
          </div>
          <div className="rounded-lg border bg-white p-5">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Vehicle
            </h2>
            <p className="font-medium">
              {[quote.vehicleYear, quote.vehicleMake, quote.vehicleModel]
                .filter(Boolean)
                .join(" ") || "Not specified"}
            </p>
            {quote.vehicleColor && (
              <p className="text-sm text-muted-foreground">
                Current: {quote.vehicleColor}
              </p>
            )}
            {quote.paintColor && (
              <p className="text-sm text-muted-foreground">
                New: {quote.paintColor} ({quote.finishType})
              </p>
            )}
            {panels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {panels.map((p) => (
                  <span
                    key={p}
                    className="rounded bg-muted px-2 py-0.5 text-xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="mb-6 rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Price Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-muted-foreground">
                    {item.category}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Labor ({quote.laborHours} hrs)</span>
              <span>{formatCurrency(quote.laborTotal ?? "0")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Materials & Supplies</span>
              <span>{formatCurrency(quote.materialsTotal ?? "0")}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal ?? "0")}</span>
            </div>
            {parseFloat(quote.taxAmount ?? "0") > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(quote.taxAmount ?? "0")}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-xl font-bold">
              <span>Total</span>
              <span>{formatCurrency(quote.total ?? "0")}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Notes
            </h2>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Approve / Decline */}
        {!isResponded && !isExpired && (
          <QuoteResponseButtons quoteId={id} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Powered by{" "}
            <span className="font-medium">QuotePaint</span>
          </p>
          {shop?.phone && <p>Questions? Call {shop.phone}</p>}
          {shop?.email && <p>or email {shop.email}</p>}
        </div>
      </main>
    </div>
  );
}
