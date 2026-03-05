"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export function QuoteResponseButtons({ quoteId }: { quoteId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [response, setResponse] = useState<"approved" | "rejected" | null>(
    null
  );

  async function handleResponse(action: "approved" | "rejected") {
    setStatus("loading");
    setResponse(action);

    try {
      await fetch(`/api/quote/${quoteId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      setStatus("done");
    } catch {
      setStatus("idle");
      setResponse(null);
    }
  }

  if (status === "done") {
    return (
      <div
        className={`rounded-lg border p-6 text-center ${
          response === "approved"
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <p className="text-lg font-medium">
          {response === "approved"
            ? "Quote approved! The shop will be in touch to schedule your appointment."
            : "Quote declined. The shop has been notified."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 text-center">
      <p className="mb-4 text-lg font-medium">
        Would you like to proceed with this quote?
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={() => handleResponse("approved")}
          disabled={status === "loading"}
          className="bg-green-600 hover:bg-green-700"
        >
          {status === "loading" && response === "approved" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve Quote
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleResponse("rejected")}
          disabled={status === "loading"}
        >
          {status === "loading" && response === "rejected" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Decline
        </Button>
      </div>
    </div>
  );
}
