"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Failed to load this page."}
        </p>
        <Button onClick={reset} className="mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
}
