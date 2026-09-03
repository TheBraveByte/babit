import { useState } from "react";
import { ReceiptDetail } from "./ReceiptDetail";
import { PageHeader, Card, Button, Error, TextInput, Field } from "@/lib/ui";
import { IconShieldCheck } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { useRecentLookups } from "@/lib/useRecentLookups";
import { RecentTable } from "@/components/RecentTable";

type Proof = components["schemas"]["v1Proof"];

export function Receipts() {
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const { entries, addLookup } = useRecentLookups("events");

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
        addLookup(eventId.trim(), `Proof · ${res.data.proof.merkle_root?.slice(0, 12) || "sealed"}`);
      }
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  // Click a recent row → auto-fill and run the lookup
  const selectRecent = (id: string) => {
    setEventId(id);
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) form.requestSubmit();
    }, 50);
  };

  if (proof) {
    return <ReceiptDetail proof={proof} onBack={() => setProof(null)} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Retrieve the sealed inclusion proof for a recorded action: event hash, Merkle root, anchor, and delegation chain."
      />

      <Card className="animate-float-up">
        <div className="space-y-5">
          <div className="h-px accent-hairline -mx-5 -mt-5" />

          <form onSubmit={lookup} className="space-y-3">
            <Field label="Event ID" hint="lookups are by id, no bulk listing endpoint">
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
            </Field>
          </form>

          {error && <Error message={error} />}

          {!error && (
            <Card title="Recent lookups" subtitle="Click a row to fetch that receipt.">
              <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
              <RecentTable entries={entries} onSelect={selectRecent} emptyLabel="Look up an event ID above to start building history." />
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
