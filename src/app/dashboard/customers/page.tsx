"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  quoteCount: number;
  totalValue: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer contacts and quote history.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No customers yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Customers are automatically created when you build a quote.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Customers ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Phone</th>
                    <th className="pb-2 text-right font-medium">Quotes</th>
                    <th className="pb-2 text-right font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-muted-foreground">
                        {c.email || "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3 text-right">{c.quoteCount}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(c.totalValue)}
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
