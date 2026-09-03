#!/usr/bin/env python3
"""Seed events with real domain links for a rich dashboard."""

import base64, json, uuid, requests

BASE = "https://babit-1-0y9x.onrender.com"
EMAIL = "yusufakinleye144@gmail.com"
PASSWORD = "babit-demo-1234"
RECORDING_GRANT = "BAL-778938"  # Marcus Webb, SecOps Lead (first delegate)
ROOT_GRANT = "BAL-998258"

ACTIONS = [
    ("browser.navigate", "https://github.com/bravebyte/babit/pull/42", "View pull request"),
    ("browser.click", "https://github.com/bravebyte/babit/pull/42", "Approve pull request"),
    ("browser.submit", "https://github.com/bravebyte/babit/pull/42", "Merge pull request"),
    ("browser.navigate", "https://github.com/bravebyte/babit/actions/runs/9831", "View CI run"),
    ("browser.click", "https://github.com/bravebyte/babit/actions/runs/9831", "Re-run failed job"),
    ("browser.navigate", "https://registry.hub.docker.com/bravebyte/babit/tags", "View container tags"),
    ("browser.click", "https://registry.hub.docker.com/bravebyte/babit/tags", "Pull latest tag"),
    ("browser.navigate", "https://docs.github.com/en/actions/deployment", "Read deployment docs"),
    ("browser.scroll", "https://docs.github.com/en/actions/deployment", "Scroll deployment docs"),
    ("browser.navigate", "https://dashboard.stripe.com/payments/pi_3abc123", "View payment details"),
    ("browser.click", "https://dashboard.stripe.com/payments/pi_3abc123", "Refund payment"),
    ("browser.type", "https://dashboard.stripe.com/payments/pi_3abc123", "Enter refund reason"),
    ("browser.submit", "https://dashboard.stripe.com/payments/pi_3abc123", "Submit refund"),
    ("browser.navigate", "https://api.stripe.com/v1/invoices/in_123456", "Fetch invoice"),
    ("browser.click", "https://api.stripe.com/v1/invoices/in_123456", "Mark invoice paid"),
    ("browser.navigate", "https://news.ycombinator.com/item?id=39201", "Read HN discussion"),
    ("browser.scroll", "https://news.ycombinator.com/item?id=39201", "Scroll comments"),
    ("browser.navigate", "https://github.com/bravebyte/babit/issues/15", "View issue"),
    ("browser.click", "https://github.com/bravebyte/babit/issues/15", "Close issue"),
    ("browser.type", "https://github.com/bravebyte/babit/issues/15", "Add closing comment"),
    ("browser.submit", "https://github.com/bravebyte/babit/issues/15", "Submit comment"),
    ("browser.navigate", "https://docs.github.com/en/pull_requests", "Read PR docs"),
    ("browser.navigate", "https://dashboard.stripe.com/customers/cus_abc", "View customer"),
    ("browser.click", "https://dashboard.stripe.com/customers/cus_abc", "Update customer"),
    ("browser.submit", "https://dashboard.stripe.com/customers/cus_abc", "Save changes"),
]

def b64(s):
    return base64.b64encode(s.encode()).decode()

def main():
    s = requests.Session()
    r = s.post(f"{BASE}/v1/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=60)
    token = r.json()["token"]
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Create a browser session
    r = s.post(f"{BASE}/v1/sessions", headers=h, json={"root_grant_id": ROOT_GRANT, "surface": "SURFACE_BROWSER"}, timeout=60)
    sid = r.json()["session"]["session_id"]
    print(f"Browser session: {sid}")

    for i, (at, resource, label) in enumerate(ACTIONS):
        payload = {"element": "button", "label": label, "selector": f"#action-{i}"}
        body = {
            "grant_id": RECORDING_GRANT,
            "action_type": at,
            "resource": resource,
            "recording_ref": f"slr://session/seed-{i}",
            "value_cents": 34999,
            "action_payload": b64(json.dumps(payload)),
            "pre_state_hash": b64(f"pre-{uuid.uuid4().hex[:8]}"),
            "post_state_hash": b64(f"post-{uuid.uuid4().hex[:8]}"),
        }
        r = s.post(f"{BASE}/v1/sessions/{sid}/actions", headers=h, json=body, timeout=60)
        if r.status_code == 200:
            eid = r.json().get("event", {}).get("event_id", "")
            print(f"  {i}: {eid} {at} → {resource[:50]}")
        else:
            print(f"  {i}: FAILED {r.status_code} {r.text[:80]}")

    s.post(f"{BASE}/v1/sessions/{sid}/end", headers=h, json={}, timeout=60)

    # Create sandbox session
    r = s.post(f"{BASE}/v1/sessions", headers=h, json={"root_grant_id": ROOT_GRANT, "surface": "SURFACE_SANDBOX"}, timeout=60)
    sid2 = r.json()["session"]["session_id"]
    print(f"\nSandbox session: {sid2}")
    for i in range(10):
        at, resource, label = ACTIONS[i % len(ACTIONS)]
        body = {
            "grant_id": RECORDING_GRANT,
            "action_type": at,
            "resource": resource,
            "recording_ref": f"slr://session/sandbox-{i}",
            "value_cents": 19999,
            "action_payload": b64(json.dumps({"action": label})),
            "pre_state_hash": b64(f"pre-{uuid.uuid4().hex[:8]}"),
            "post_state_hash": b64(f"post-{uuid.uuid4().hex[:8]}"),
        }
        r = s.post(f"{BASE}/v1/sessions/{sid2}/actions", headers=h, json=body, timeout=60)
        if r.status_code == 200:
            print(f"  {i}: {r.json()['event']['event_id']} {at}")
        else:
            print(f"  {i}: FAILED {r.status_code}")
    s.post(f"{BASE}/v1/sessions/{sid2}/end", headers=h, json={}, timeout=60)

    # Create desktop session
    r = s.post(f"{BASE}/v1/sessions", headers=h, json={"root_grant_id": ROOT_GRANT, "surface": "SURFACE_DESKTOP"}, timeout=60)
    sid3 = r.json()["session"]["session_id"]
    print(f"\nDesktop session: {sid3}")
    for i in range(8):
        at, resource, label = ACTIONS[i % len(ACTIONS)]
        body = {
            "grant_id": RECORDING_GRANT,
            "action_type": at,
            "resource": resource,
            "recording_ref": f"slr://session/desktop-{i}",
            "value_cents": 49999,
            "action_payload": b64(json.dumps({"action": label})),
            "pre_state_hash": b64(f"pre-{uuid.uuid4().hex[:8]}"),
            "post_state_hash": b64(f"post-{uuid.uuid4().hex[:8]}"),
        }
        r = s.post(f"{BASE}/v1/sessions/{sid3}/actions", headers=h, json=body, timeout=60)
        if r.status_code == 200:
            print(f"  {i}: {r.json()['event']['event_id']} {at}")
        else:
            print(f"  {i}: FAILED {r.status_code}")
    s.post(f"{BASE}/v1/sessions/{sid3}/end", headers=h, json={}, timeout=60)

    # Final analytics
    print("\n=== Analytics ===")
    r = s.get(f"{BASE}/v1/analytics/overview?days=30", headers=h, timeout=60)
    print(json.dumps(r.json(), indent=2))

if __name__ == "__main__":
    main()
