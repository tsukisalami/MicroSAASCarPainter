"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Check,
  X,
  Trash2,
  FileText,
  Loader2,
  Download,
  Link2,
  Mail,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface QuoteDetail {
  id: string;
  quoteNumber: string;
  status: string;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  serviceType: string | null;
  paintColor: string | null;
  paintBrand: string | null;
  finishType: string | null;
  panels: string | null;
  laborHours: string;
  laborTotal: string;
  materialsTotal: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  lineItems: {
    id: string;
    description: string;
    category: string | null;
    quantity: string;
    unitPrice: string;
    total: string;
    isLabor: boolean;
  }[];
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "destructive" | "warning" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  viewed: { label: "Viewed", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "outline" },
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setQuote((prev) => (prev ? { ...prev, status: updated.status } : prev));
    }
    setUpdating(false);
  }

  async function handleSendEmail() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setQuote((prev) => (prev ? { ...prev, status: "sent" } : prev));
        alert("Quote sent via email!");
      } else {
        alert(data.error || "Failed to send email.");
      }
    } catch {
      alert("Failed to send email.");
    }
    setUpdating(false);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/quote/${id}`;
    navigator.clipboard.writeText(url);
    alert("Quote link copied to clipboard!");
  }

  async function handleDownloadPdf() {
    try {
      const res = await fetch(`/api/quotes/${id}/pdf`);
      if (!res.ok) return;
      const data = await res.json();
      const { generateQuotePdf } = await import("@/components/quotes/quote-pdf");
      const blob = await generateQuotePdf(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quote?.quoteNumber ?? "quote"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    router.push("/dashboard/quotes");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Quote not found.</p>
        <Link href="/dashboard/quotes" className="mt-4 inline-block">
          <Button variant="outline">Back to Quotes</Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.draft;
  const panels: string[] = quote.panels ? JSON.parse(quote.panels) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <Link
            href="/dashboard/quotes"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Quotes
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {quote.quoteNumber}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(quote.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quote.status === "draft" && (
            <>
              <Button
                onClick={handleSendEmail}
                disabled={updating}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStatus("sent")}
                disabled={updating}
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          {(quote.status === "sent" || quote.status === "viewed") && (
            <>
              <Button
                onClick={() => updateStatus("approved")}
                disabled={updating}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStatus("rejected")}
                disabled={updating}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Customer & Vehicle */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            {quote.customer ? (
              <div>
                <p className="font-medium">{quote.customer.name}</p>
                {quote.customer.email && (
                  <p className="text-sm text-muted-foreground">
                    {quote.customer.email}
                  </p>
                )}
                {quote.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {quote.customer.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Walk-in customer</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {[quote.vehicleYear, quote.vehicleMake, quote.vehicleModel]
                .filter(Boolean)
                .join(" ") || "Not specified"}
            </p>
            {quote.vehicleColor && (
              <p className="text-sm text-muted-foreground">
                Current color: {quote.vehicleColor}
              </p>
            )}
            {quote.paintColor && (
              <p className="text-sm text-muted-foreground">
                New color: {quote.paintColor} ({quote.finishType})
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
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.lineItems.map((item) => (
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
          </div>

          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Labor ({quote.laborHours} hrs)</span>
              <span>{formatCurrency(quote.laborTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Materials & Supplies</span>
              <span>{formatCurrency(quote.materialsTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {parseFloat(quote.taxAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(quote.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
