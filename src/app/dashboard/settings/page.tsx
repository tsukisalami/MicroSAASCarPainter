"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [subscription, setSubscription] = useState({
    tier: "free",
    quotesThisMonth: 0,
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    hourlyRate: "75.00",
    taxRate: "0.00",
    materialMarkup: "25.00",
    currency: "USD",
  });

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((shop) => {
        if (shop?.id) {
          setForm({
            name: shop.name ?? "",
            email: shop.email ?? "",
            phone: shop.phone ?? "",
            address: shop.address ?? "",
            city: shop.city ?? "",
            state: shop.state ?? "",
            zip: shop.zip ?? "",
            hourlyRate: shop.hourlyRate ?? "75.00",
            taxRate: shop.taxRate ?? "0.00",
            materialMarkup: shop.materialMarkup ?? "25.00",
            currency: shop.currency ?? "USD",
          });
          setSubscription({
            tier: shop.subscriptionTier ?? "free",
            quotesThisMonth: shop.quotesThisMonth ?? 0,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/shop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your shop profile and quoting defaults.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
            <CardDescription>
              This appears on your quotes and customer communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Mike's Auto Body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopEmail">Shop Email</Label>
                <Input
                  id="shopEmail"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="info@mikesautobody.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopPhone">Phone</Label>
                <Input
                  id="shopPhone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Springfield"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="IL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input
                  id="zip"
                  value={form.zip}
                  onChange={(e) => updateField("zip", e.target.value)}
                  placeholder="62701"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quoting Defaults</CardTitle>
            <CardDescription>
              Set your rates — these are used to auto-calculate every quote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Labor Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) => updateField("hourlyRate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => updateField("taxRate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialMarkup">Material Markup (%)</Label>
                <Input
                  id="materialMarkup"
                  type="number"
                  step="0.01"
                  value={form.materialMarkup}
                  onChange={(e) => updateField("materialMarkup", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                id="currency"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Saved
              </span>
            )}
          </CardFooter>
        </Card>
      </form>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium capitalize">{subscription.tier} Plan</p>
                <Badge variant={subscription.tier === "free" ? "secondary" : "default"}>
                  {subscription.tier === "free" ? "Free" : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.tier === "free"
                  ? `${subscription.quotesThisMonth}/5 quotes used this month`
                  : "Unlimited quotes"}
              </p>
            </div>
            {subscription.tier === "free" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={billingLoading}
                  onClick={async () => {
                    setBillingLoading(true);
                    const res = await fetch("/api/billing/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "pro" }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else {
                      alert(data.error || "Failed to start checkout.");
                      setBillingLoading(false);
                    }
                  }}
                >
                  Upgrade to Pro ($29/mo)
                </Button>
              </div>
            )}
            {subscription.tier !== "free" && (
              <Button
                variant="outline"
                size="sm"
                disabled={billingLoading}
                onClick={async () => {
                  setBillingLoading(true);
                  const res = await fetch("/api/billing/portal", {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else {
                    alert(data.error || "Failed to open billing portal.");
                    setBillingLoading(false);
                  }
                }}
              >
                Manage Billing
              </Button>
            )}
          </div>

          {subscription.tier === "free" && (
            <div className="rounded-md bg-primary/5 p-4">
              <p className="text-sm font-medium">Upgrade benefits:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Unlimited quotes per month</li>
                <li>Custom branding on PDFs</li>
                <li>Email delivery to customers</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
