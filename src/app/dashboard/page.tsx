"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, DollarSign, TrendingUp, Plus, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  totalQuotes: number;
  quotesThisMonth: number;
  customerCount: number;
  approvedRevenue: string;
  pipeline: string;
  conversionRate: number;
  recentQuotes: {
    id: string;
    quoteNumber: string;
    status: string;
    total: string;
    vehicleMake: string | null;
    vehicleModel: string | null;
    createdAt: string;
  }[];
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning" | "outline"> = {
  draft: "secondary",
  sent: "default",
  viewed: "warning",
  approved: "success",
  rejected: "destructive",
  expired: "outline",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Quotes",
      value: String(data?.totalQuotes ?? 0),
      sub: `${data?.quotesThisMonth ?? 0} this month`,
      icon: FileText,
    },
    {
      label: "Customers",
      value: String(data?.customerCount ?? 0),
      sub: "",
      icon: Users,
    },
    {
      label: "Approved Revenue",
      value: formatCurrency(data?.approvedRevenue ?? "0"),
      sub: `${formatCurrency(data?.pipeline ?? "0")} pipeline`,
      icon: DollarSign,
    },
    {
      label: "Conversion Rate",
      value: `${data?.conversionRate ?? 0}%`,
      sub: "sent → approved",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your quoting activity.
          </p>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.sub && (
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Quotes</CardTitle>
          <Link href="/dashboard/quotes">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!data?.recentQuotes?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No quotes yet. Create your first quote to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/dashboard/quotes/${q.id}`}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{q.quoteNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {[q.vehicleMake, q.vehicleModel].filter(Boolean).join(" ") || "Vehicle TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[q.status] ?? "secondary"}>
                      {q.status}
                    </Badge>
                    <span className="font-medium">
                      {formatCurrency(q.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
