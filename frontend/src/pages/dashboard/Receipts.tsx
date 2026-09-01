import { useState } from "react";
import { ReceiptDetail } from "./ReceiptDetail";
import { Button, Error, EmptyState, TextInput } from "@/lib/ui";
import { IconFileText, IconShieldCheck } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type Proof = components["schemas"]["v1Proof"];

export function Receipts() {
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId.trim()) return;
    setLoading(true);
    setError(null);
    setProof(null);
    try {
      const res = await api.GET("/v1/events/{event_id}:proof", {
        params: { path: { event_id: eventId.trim() } },
      });
      if (res.error || !res.data?.proof) {
        setError(errText(res.error) || "No inclusion proof found for that event ID.");
      } else {
        setProof(res.data.proof);
      }
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  if (proof) {
    return <ReceiptDetail proof={proof} onBack={() => setProof(null)} />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Receipts
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Retrieve the sealed inclusion proof for a recorded action: event hash, Merkle root, anchor, and delegation chain.
        </p>
      </div>

      <form
        onSubmit={lookup}
        className="p-4 rounded-babit-lg shadow-xs space-y-3"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <label className="text-xs font-medium" style={{ color: "var(--fg)" }}>Look up a receipt by event ID</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <TextInput
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="e.g. BAL-778812"
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!eventId.trim()}>
            <IconShieldCheck className="w-4 h-4" />
            <span>Fetch Proof</span>
          </Button>
        </div>
      </form>

      {error && <Error message={error} />}

      {!error && (
        <EmptyState
          title="No receipt loaded"
          description="Enter an action event ID above to fetch its cryptographic receipt. Babit has no bulk listing endpoint yet, so receipts are retrieved individually by ID."
          icon={<IconFileText className="w-5 h-5" />}
        />
      )}
    </div>
  );
}
