"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { calculateQuote, type QuoteCalculation } from "@/lib/quote-calculator";
import { formatCurrency } from "@/lib/utils";

const SERVICE_TYPES = [
  { value: "full_repaint", label: "Full Repaint" },
  { value: "panel_repair", label: "Panel Repair" },
  { value: "touch_up", label: "Touch Up" },
  { value: "custom_paint", label: "Custom Paint" },
  { value: "clear_coat", label: "Clear Coat Restoration" },
  { value: "spot_repair", label: "Spot Repair" },
];

const FINISH_TYPES = [
  { value: "solid", label: "Solid" },
  { value: "metallic", label: "Metallic" },
  { value: "pearl", label: "Pearl" },
  { value: "matte", label: "Matte" },
  { value: "satin", label: "Satin" },
  { value: "candy", label: "Candy" },
];

const ALL_PANELS = [
  "Hood",
  "Roof",
  "Trunk",
  "Front Bumper",
  "Rear Bumper",
  "Front Left Fender",
  "Front Right Fender",
  "Rear Left Quarter",
  "Rear Right Quarter",
  "Left Front Door",
  "Left Rear Door",
  "Right Front Door",
  "Right Rear Door",
  "Left Rocker Panel",
  "Right Rocker Panel",
  "Left Mirror",
  "Right Mirror",
];

const STEPS = ["Vehicle Info", "Service & Paint", "Panels", "Review & Price"];

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [calculation, setCalculation] = useState<QuoteCalculation | null>(null);
  const [shopSettings, setShopSettings] = useState({
    hourlyRate: 75,
    materialMarkup: 25,
    taxRate: 0,
    currency: "USD",
  });
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    serviceType: "panel_repair",
    paintColor: "",
    paintBrand: "",
    finishType: "solid",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((shop) => {
        if (shop?.hourlyRate) {
          setShopSettings({
            hourlyRate: parseFloat(shop.hourlyRate),
            materialMarkup: parseFloat(shop.materialMarkup ?? "25"),
            taxRate: parseFloat(shop.taxRate ?? "0"),
            currency: shop.currency ?? "USD",
          });
        }
      })
      .catch(() => {});
  }, []);

  // Recalculate when entering review step
  useEffect(() => {
    if (step === 3) {
      const panels =
        form.serviceType === "full_repaint" ? ALL_PANELS : selectedPanels;
      const calc = calculateQuote({
        serviceType: form.serviceType,
        finishType: form.finishType,
        panels,
        hourlyRate: shopSettings.hourlyRate,
        materialMarkup: shopSettings.materialMarkup,
        taxRate: shopSettings.taxRate,
      });
      setCalculation(calc);
    }
  }, [step, form.serviceType, form.finishType, selectedPanels, shopSettings]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function togglePanel(panel: string) {
    setSelectedPanels((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  }

  async function handleCreateQuote() {
    setSaving(true);
    try {
      const panels =
        form.serviceType === "full_repaint" ? ALL_PANELS : selectedPanels;
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicleYear: form.vehicleYear ? parseInt(form.vehicleYear) : undefined,
          panels,
          hourlyRate: shopSettings.hourlyRate,
          materialMarkup: shopSettings.materialMarkup,
          taxRate: shopSettings.taxRate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create quote");
        setSaving(false);
        return;
      }

      const quote = await res.json();
      router.push(`/dashboard/quotes/${quote.id}`);
    } catch {
      alert("Failed to create quote. Please try again.");
      setSaving(false);
    }
  }

  const isFullRepaint = form.serviceType === "full_repaint";
  const panelsForQuote = isFullRepaint ? ALL_PANELS : selectedPanels;
  const canProceedStep2 = panelsForQuote.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
        <p className="text-muted-foreground">
          Build a professional paint job estimate step by step.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i <= step ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Vehicle Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Customer Info</CardTitle>
            <CardDescription>
              Enter the vehicle and customer details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) => updateForm("customerName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => updateForm("customerEmail", e.target.value)}
                  placeholder="john@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={form.customerPhone}
                  onChange={(e) => updateForm("customerPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <hr className="my-4" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Year</Label>
                <Input
                  id="vehicleYear"
                  value={form.vehicleYear}
                  onChange={(e) => updateForm("vehicleYear", e.target.value)}
                  placeholder="2022"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">Make</Label>
                <Input
                  id="vehicleMake"
                  value={form.vehicleMake}
                  onChange={(e) => updateForm("vehicleMake", e.target.value)}
                  placeholder="Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model</Label>
                <Input
                  id="vehicleModel"
                  value={form.vehicleModel}
                  onChange={(e) => updateForm("vehicleModel", e.target.value)}
                  placeholder="Camry"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleColor">Current Color</Label>
              <Input
                id="vehicleColor"
                value={form.vehicleColor}
                onChange={(e) => updateForm("vehicleColor", e.target.value)}
                placeholder="Silver"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Service & Paint */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Service & Paint Details</CardTitle>
            <CardDescription>
              Select the type of work and paint specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                id="serviceType"
                value={form.serviceType}
                onChange={(e) => updateForm("serviceType", e.target.value)}
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paintColor">New Paint Color</Label>
                <Input
                  id="paintColor"
                  value={form.paintColor}
                  onChange={(e) => updateForm("paintColor", e.target.value)}
                  placeholder="Midnight Blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paintBrand">Paint Brand</Label>
                <Input
                  id="paintBrand"
                  value={form.paintBrand}
                  onChange={(e) => updateForm("paintBrand", e.target.value)}
                  placeholder="PPG, Axalta, BASF..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="finishType">Finish Type</Label>
              <Select
                id="finishType"
                value={form.finishType}
                onChange={(e) => updateForm("finishType", e.target.value)}
              >
                {FINISH_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Panel Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Panel Selection</CardTitle>
            <CardDescription>
              {isFullRepaint
                ? "Full repaint selected — all panels are included."
                : "Click the panels that need paint work."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFullRepaint ? (
              <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
                All {ALL_PANELS.length} panels included in full repaint.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                {ALL_PANELS.map((panel) => (
                  <button
                    key={panel}
                    type="button"
                    onClick={() => togglePanel(panel)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      selectedPanels.includes(panel)
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {panel}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Rust spots, dents, special requests..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Price */}
      {step === 3 && calculation && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>
                Review the details and pricing before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {form.customerName || "Walk-in"}
                  </p>
                  {form.customerEmail && (
                    <p className="text-sm">{form.customerEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {[form.vehicleYear, form.vehicleMake, form.vehicleModel]
                      .filter(Boolean)
                      .join(" ") || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">
                    {SERVICE_TYPES.find((s) => s.value === form.serviceType)?.label}
                  </p>
                  <p className="text-sm">
                    {form.paintColor || "Color TBD"} &mdash;{" "}
                    {FINISH_TYPES.find((f) => f.value === form.finishType)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Panels</p>
                  <p className="font-medium">
                    {isFullRepaint
                      ? `All (${ALL_PANELS.length})`
                      : `${selectedPanels.length} selected`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
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
                    {calculation.lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2">{item.description}</td>
                        <td className="py-2 text-muted-foreground">
                          {item.category}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.total, shopSettings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Labor ({calculation.laborHours} hrs @ {formatCurrency(shopSettings.hourlyRate, shopSettings.currency)}/hr)</span>
                  <span>{formatCurrency(calculation.laborTotal, shopSettings.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materials & Supplies</span>
                  <span>{formatCurrency(calculation.materialsTotal, shopSettings.currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculation.subtotal, shopSettings.currency)}</span>
                </div>
                {calculation.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({shopSettings.taxRate}%)</span>
                    <span>{formatCurrency(calculation.taxAmount, shopSettings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(calculation.total, shopSettings.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !form.customerName}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreateQuote} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Creating..." : "Create Quote"}
          </Button>
        )}
      </div>
    </div>
  );
}
