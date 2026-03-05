"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface QuoteSummary {
  id: string;
  quoteNumber: string;
  status: string;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  serviceType: string | null;
  total: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning" | "outline"> = {
  draft: "secondary",
  sent: "default",
  viewed: "warning",
  approved: "success",
  rejected: "destructive",
  expired: "outline",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Manage and track your paint job quotes.
          </p>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No quotes yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first quote to start closing more deals.
            </p>
            <Link href="/dashboard/quotes/new" className="mt-4">
              <Button>Create First Quote</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Quotes ({quotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Quote #</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Vehicle</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                    <th className="pb-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <Link
                          href={`/dashboard/quotes/${q.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {q.quoteNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        {q.customerName || "Walk-in"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {[q.vehicleYear, q.vehicleMake, q.vehicleModel]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </td>
                      <td className="py-3">
                        <Badge variant={STATUS_VARIANT[q.status] ?? "secondary"}>
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(q.total)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
