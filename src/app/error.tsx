"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} className="mt-6">
          Try Again
        </Button>
      </div>
    </div>
  );
}
