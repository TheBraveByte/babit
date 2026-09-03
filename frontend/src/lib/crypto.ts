export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", buffer as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function truncateHash(hash: string, lead = 10, tail = 8): string {
  if (!hash || hash.length <= lead + tail) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

export interface LiveSimulatedEvent {
  actionId: string;
  actionName: string;
  agent: string;
  principal: string;
  grantId: string;
  resource: string;
  amountUsd?: number;
  payload: Record<string, unknown>;
  timestamp: string;
  prevHash: string;
  eventHash: string;
  merkleRoot: string;
  notarySignature: string;
  receiptId: string;
}

export async function computeLiveReceipt(params: {
  actionName: string;
  agent: string;
  principal: string;
  grantId: string;
  resource: string;
  amountUsd?: number;
  customPayload?: Record<string, unknown>;
  prevHash?: string;
}): Promise<LiveSimulatedEvent> {
  const timestamp = new Date().toISOString();
  const actionId = `act_${Math.random().toString(36).substring(2, 10)}`;
  const receiptId = `rcpt_BAL_${Math.floor(100000 + Math.random() * 900000)}`;
  const prevHash =
    params.prevHash || "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102";

  const payload = params.customPayload || {
    action: params.actionName,
    agent_id: params.agent,
    resource: params.resource,
    amount_usd: params.amountUsd,
    authorized_by: params.principal,
    grant_ticket: params.grantId,
  };

  const payloadString = JSON.stringify(payload);
  const rawHash = await sha256Hex(`${prevHash}:${actionId}:${payloadString}:${timestamp}`);
  const eventHash = `0x${rawHash}`;
  const rootRaw = await sha256Hex(`${eventHash}:${prevHash}:merkle_root_attestation`);
  const merkleRoot = `0x${rootRaw}`;
  const sigRaw = await sha256Hex(`notary_ed25519_sig:${merkleRoot}`);
  const notarySignature = `ed25519:${sigRaw}`;

  return {
    actionId,
    actionName: params.actionName,
    agent: params.agent,
    principal: params.principal,
    grantId: params.grantId,
    resource: params.resource,
    amountUsd: params.amountUsd,
    payload,
    timestamp,
    prevHash,
    eventHash,
    merkleRoot,
    notarySignature,
    receiptId,
  };
}
