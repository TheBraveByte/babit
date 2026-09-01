import { useState } from "react";
import { IconSearch } from "@/lib/icons";

interface AdminAuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
}

const mockAdminLogs: AdminAuditEvent[] = [
  {
    id: "adm_9081",
    time: "2026-09-01 10:41:00 UTC",
    actor: "yusuf@enterprise.com",
    action: "authorization.grant_created",
    resource: "BAL-DEL-8921 (claims.approve)",
    ip: "192.168.1.104",
  },
  {
    id: "adm_9080",
    time: "2026-09-01 09:15:20 UTC",
    actor: "yusuf@enterprise.com",
    action: "agent.registered",
    resource: "agt_worker_browser_09",
    ip: "192.168.1.104",
  },
  {
    id: "adm_9079",
    time: "2026-09-01 08:30:11 UTC",
    actor: "admin@enterprise.com",
    action: "apikey.created",
    resource: "slr_live_***9pdQ4",
    ip: "10.0.4.12",
  },
  {
    id: "adm_9078",
    time: "2026-08-31 16:20:00 UTC",
    actor: "yusuf@enterprise.com",
    action: "authorization.revoked",
    resource: "BAL-DEL-1092 (unauthorized-worker)",
    ip: "192.168.1.104",
  },
  {
    id: "adm_9077",
    time: "2026-08-31 14:00:00 UTC",
    actor: "admin@enterprise.com",
    action: "member.invited",
    resource: "auditor@compliance.org",
    ip: "10.0.4.12",
  },
];

export function AuditLog() {
  const [search, setSearch] = useState("");

  const filtered = mockAdminLogs.filter(
    (l) =>
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Administrative Audit Log</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Record of administrative actions (member invites, key creations, setting alterations) separate from the action ledger.
        </p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search administrative logs…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 bg-neutral-50/50 outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Log ID</th>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Actor</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Target Resource</th>
                <th className="px-4 py-2.5 font-medium text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{log.id}</td>
                  <td className="px-4 py-3 text-neutral-500 tnum">{log.time}</td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">{log.actor}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{log.resource}</td>
                  <td className="px-4 py-3 text-right text-neutral-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
