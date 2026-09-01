import { useState, useEffect } from "react";

interface LiveEvent {
  id: string;
  time: string;
  type: string;
  detail: string;
  status: string;
}

export function LiveStream() {
  const [events, setEvents] = useState<LiveEvent[]>([
    {
      id: "ev_8491",
      time: "10:42:19.49",
      type: "Receipt Sealed",
      detail: "act_payout_authorized_491",
      status: "VERIFIED",
    },
    {
      id: "ev_8490",
      time: "10:42:19.48",
      type: "Merkle Proof",
      detail: "Leaf inserted @ root_9f83",
      status: "SEALED",
    },
    {
      id: "ev_8489",
      time: "10:42:18.12",
      type: "Signature Generated",
      detail: "Notary Ed25519 signature",
      status: "VALID",
    },
    {
      id: "ev_8488",
      time: "10:42:18.01",
      type: "Action Recorded",
      detail: "agt_claims_01: browser.click",
      status: "CAPTURED",
    },
    {
      id: "ev_8487",
      time: "10:41:45.30",
      type: "Delegation Check",
      detail: "BAL-DEL-8921 validated",
      status: "AUTHORIZED",
    },
  ]);

  // Simulate subtle real-time event streaming
  useEffect(() => {
    const actions = [
      { type: "Action Recorded", detail: "agt_triager: review_claim", status: "CAPTURED" },
      { type: "Signature Generated", detail: "Ed25519 notary key signed", status: "VALID" },
      { type: "Merkle Proof", detail: "Inclusion proof generated", status: "SEALED" },
      { type: "Receipt Sealed", detail: "rcpt_live_" + Math.floor(Math.random() * 9000 + 1000), status: "VERIFIED" },
    ];

    const timer = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).slice(0, 2);
      
      const newEvent: LiveEvent = {
        id: "ev_" + Math.floor(Math.random() * 9000 + 1000),
        time: timeStr,
        type: randomAction.type,
        detail: randomAction.detail,
        status: randomAction.status,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-neutral-200 bg-white rounded-lg p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-900 uppercase font-mono tracking-wider">
            Live Stream
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">REAL-TIME INTAKE</span>
      </div>

      <div className="space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-100/80 text-xs font-mono animate-fade-in hover:bg-neutral-100/60 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-medium text-[11px]">
                <span>{e.type}</span>
              </div>
              <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">
                {e.detail}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold block">
                {e.status}
              </span>
              <span className="text-[9px] text-neutral-400 tnum block mt-0.5">{e.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
