import { useEffect, useRef, useState } from "react";
import { apiBaseUrl, getAuthToken } from "@/api/client";
import type { components } from "@/api/schema";
import { IconPlay, IconXCircle } from "@/lib/icons";
import { Button, Error as ErrorBox } from "@/lib/ui";

type ReplayResponse = components["schemas"]["v1GetReplayResponse"];

interface ReplayModalProps {
  sessionId: string;
  onClose: () => void;
}

export function ReplayModal({ sessionId, onClose }: ReplayModalProps) {
  const [events, setEvents] = useState<ReplayResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${apiBaseUrl}/v1/sessions/${encodeURIComponent(sessionId)}:replay`, {
      credentials: "include",
      headers,
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Replay failed: ${res.status} ${text}`);
        }
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed) as { result?: ReplayResponse } & ReplayResponse;
              const result = parsed.result ?? (parsed as ReplayResponse);
              if (result) setEvents((prev) => [...prev, result]);
            } catch {
              // ignore malformed chunks
            }
          }
        }
        setDone(true);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setError(e.message || "Replay stream failed");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border rounded-babit-md max-w-3xl w-full max-h-[80vh] flex flex-col"
        style={{ borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <IconPlay className="w-4 h-4 text-[var(--brand-accent)]" />
            <h2
              className="text-sm font-mono font-semibold uppercase tracking-wider"
              style={{ color: "var(--fg)" }}
            >
              Replay
            </h2>
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              {sessionId}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close replay">
            <IconXCircle className="w-4 h-4" />
          </Button>
        </header>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && <ErrorBox message={error} />}
          {events.length === 0 && !loading && !error && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No replay events for this session.
            </p>
          )}
          {events.map((ev, i) => (
            <ReplayEventView key={i} index={i + 1} data={ev} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
              <div
                className="w-4 h-4 rounded-full animate-spin border-2"
                style={{ borderColor: "var(--border)", borderTopColor: "var(--brand-accent)" }}
              />
              Streaming replay…
            </div>
          )}
          {done && events.length > 0 && (
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              End of replay
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplayEventView({ index, data }: { index: number; data: ReplayResponse }) {
  const event = data.event;
  const frame = decodeFrame(data.frame);

  return (
    <div
      className="rounded-babit p-3 space-y-2"
      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-semibold" style={{ color: "var(--fg)" }}>
          #{index} {event?.action_type || "unknown"}
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
          seq {event?.sequence ?? "-"} ·{" "}
          {event?.occurred_at ? new Date(event.occurred_at).toLocaleTimeString() : "-"}
        </span>
      </div>
      {event?.recording_ref && (
        <p className="text-[10px] font-mono truncate" style={{ color: "var(--muted)" }}>
          {event.recording_ref}
        </p>
      )}
      {frame.kind === "image" && (
        <img
          src={frame.data}
          alt={`Replay frame ${index}`}
          className="max-w-full rounded border"
          style={{ borderColor: "var(--border-subtle)" }}
        />
      )}
      {frame.kind === "text" && (
        <pre
          className="text-[10px] font-mono overflow-auto max-h-40 p-2 rounded"
          style={{ backgroundColor: "var(--surface)", color: "var(--fg)" }}
        >
          {frame.data}
        </pre>
      )}
      {frame.kind === "binary" && (
        <p className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
          {frame.data}
        </p>
      )}
    </div>
  );
}

function decodeFrame(b64: string | undefined): {
  kind: "image" | "text" | "binary" | "empty";
  data: string;
} {
  if (!b64) return { kind: "empty", data: "" };
  try {
    const decoded = atob(b64);
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
    if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { kind: "image", data: `data:image/png;base64,${b64}` };
    }
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
      return { kind: "image", data: `data:image/jpeg;base64,${b64}` };
    }
    const printable = Array.from(bytes).every(
      (b) => b === 0x0a || b === 0x0d || (b >= 0x20 && b < 0x7f),
    );
    if (printable) return { kind: "text", data: decoded };
    return { kind: "binary", data: `binary frame (${bytes.length} bytes)` };
  } catch {
    return { kind: "empty", data: "" };
  }
}
