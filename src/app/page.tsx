import Link from "next/link";
import { PaintBucket, FileText, Clock, DollarSign, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Clock,
    title: "Quotes in Under 2 Minutes",
    description:
      "Step-by-step builder with auto-calculated labor, materials, and tax. No more spreadsheets.",
  },
  {
    icon: FileText,
    title: "Professional Branded PDFs",
    description:
      "Send polished, itemized quotes with your shop logo. Stand out from the competition.",
  },
  {
    icon: DollarSign,
    title: "Stop Leaving Money on the Table",
    description:
      "Built-in line items for every billable task — sanding, masking, primer, clear coat. Never miss a charge.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["5 quotes/month", "Basic PDF output", "1 user"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited quotes",
      "Custom branding",
      "Email delivery",
      "Analytics dashboard",
      "Customer management",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Shop",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "Multi-user access",
      "SMS follow-ups",
      "Priority support",
      "QuickBooks sync (soon)",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <PaintBucket className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">QuotePaint</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          Built for independent auto body shops
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Professional paint quotes
          <br />
          <span className="text-primary">in under 2 minutes</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Stop losing 40% of your customers to slow, inaccurate estimates.
          QuotePaint auto-calculates labor, materials, and tax — then delivers
          branded PDF quotes your customers can approve with one click.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="text-base">
              Start Free — No Credit Card
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why shops switch to QuotePaint
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            Start free. Upgrade when you&apos;re ready.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border p-6 ${
                  plan.highlight
                    ? "border-primary ring-2 ring-primary/20"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-6 block">
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PaintBucket className="h-4 w-4" />
            QuotePaint &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
