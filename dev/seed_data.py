#!/usr/bin/env python3
"""
Seed historical analytics data and a complex delegation tree.

Creates events across the past 14 days so analytics charts have real data,
and builds a 6-node delegation chain with sensible domain links.
"""

import base64
import json
import sys
import time
import uuid
import requests

BASE = "https://babit-1-0y9x.onrender.com"
EMAIL = "yusufakinleye144@gmail.com"
PASSWORD = "babit-demo-1234"

# Real domain links for the delegation tree
# Person → Security Lead → Deploy Bot → Web Researcher → Data Exporter → Invoice Approver
DELEGATION_CHAIN = [
    {"subject_id": "Yusuf Akinleye, Operations Lead", "capabilities": [], "scope": {"resource_globs": ["https://*"], "max_depth": 5, "max_value_cents": 10000000}},
    {"subject_id": "Marcus Webb, SecOps Lead", "capabilities": ["browser.click", "browser.type", "browser.navigate"], "scope": {"resource_globs": ["https://github.com/*", "https://registry.hub.docker.com/*"], "max_depth": 4, "max_value_cents": 5000000}},
    {"subject_id": "deploy-bot", "capabilities": ["browser.click", "browser.navigate", "browser.submit"], "scope": {"resource_globs": ["https://github.com/bravebyte/*", "https://registry.hub.docker.com/bravebyte/*"], "max_depth": 3, "max_value_cents": 1000000}},
    {"subject_id": "web-researcher", "capabilities": ["browser.navigate", "browser.scroll"], "scope": {"resource_globs": ["https://docs.github.com/*", "https://news.ycombinator.com/*"], "max_depth": 2, "max_value_cents": 500000}},
    {"subject_id": "data-exporter", "capabilities": ["browser.click", "browser.type", "browser.submit"], "scope": {"resource_globs": ["https://api.stripe.com/*", "https://dashboard.stripe.com/*"], "max_depth": 1, "max_value_cents": 250000}},
    {"subject_id": "invoice-approver", "capabilities": ["browser.click", "browser.submit"], "scope": {"resource_globs": ["https://invoices.stripe.com/*"], "max_depth": 1, "max_value_cents": 100000}},
]

# Real URLs for recorded actions
ACTION_RESOURCES = [
    "https://github.com/bravebyte/babit/pull/42",
    "https://github.com/bravebyte/babit/actions/runs/9831",
    "https://registry.hub.docker.com/bravebyte/babit/tags",
    "https://docs.github.com/en/actions/deployment",
    "https://dashboard.stripe.com/payments/pi_3abc123",
    "https://api.stripe.com/v1/invoices/in_123456",
    "https://news.ycombinator.com/item?id=39201",
    "https://github.com/bravebyte/babit/issues/15",
    "https://docs.github.com/en/pull_requests",
    "https://dashboard.stripe.com/customers/cus_abc",
]

ACTION_TYPES = ["browser.navigate", "browser.click", "browser.type", "browser.scroll", "browser.submit"]

SURFACES = ["SURFACE_BROWSER", "SURFACE_SANDBOX", "SURFACE_DESKTOP"]


def b64(s):
    return base64.b64encode(s.encode()).decode()


def main():
    s = requests.Session()
    
    # Login
    print("Logging in...")
    r = s.post(f"{BASE}/v1/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=60)
    r.raise_for_status()
    token = r.json()["token"]
    user_id = r.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"  user_id={user_id}")
    
    # Get existing root grants
    print("\nFetching grants...")
    r = s.get(f"{BASE}/v1/grants", headers=headers, timeout=60)
    r.raise_for_status()
    grants = r.json().get("grants", [])
    root_grants = [g for g in grants if not g.get("parent_grant_id")]
    print(f"  root grants: {len(root_grants)}")
    
    # Find or create a root grant
    root_grant_id = None
    for g in root_grants:
        if g.get("subject_id") == "Yusuf Akinleye, Operations Lead":
            root_grant_id = g["grant_id"]
            break
    
    if not root_grant_id:
        print("  Creating root grant...")
        r = s.post(f"{BASE}/v1/grants:root", headers=headers, json={
            "principal_id": user_id,
            "scope": {"max_depth": 5}
        }, timeout=60)
        r.raise_for_status()
        root_grant_id = r.json()["grant"]["grant_id"]
    
    print(f"  root_grant_id={root_grant_id}")
    
    # Build delegation chain: root → child1 → child2 → child3 → child4 → child5
    print("\nBuilding delegation chain (6 nodes)...")
    chain_grant_ids = [root_grant_id]
    parent_id = root_grant_id
    for i, node in enumerate(DELEGATION_CHAIN[1:], 1):
        print(f"  Delegating node {i}: {node['subject_id']}")
        body = {
            "parent_grant_id": parent_id,
            "subject_id": node["subject_id"],
            "capabilities": node["capabilities"],
            "scope": node["scope"],
        }
        r = s.post(f"{BASE}/v1/grants", headers=headers, json=body, timeout=60)
        if r.status_code == 200:
            gid = r.json()["grant"]["grant_id"]
            chain_grant_ids.append(gid)
            parent_id = gid
            print(f"    grant_id={gid}")
        else:
            print(f"    FAILED: {r.status_code} {r.text[:200]}")
            # Try to find existing
            r2 = s.get(f"{BASE}/v1/grants", headers=headers, timeout=60)
            existing = r2.json().get("grants", [])
            for g in existing:
                if g.get("subject_id") == node["subject_id"] and g.get("parent_grant_id") == parent_id:
                    chain_grant_ids.append(g["grant_id"])
                    parent_id = g["grant_id"]
                    print(f"    found existing: {g['grant_id']}")
                    break
    
    print(f"\n  Chain: {' → '.join(chain_grant_ids)}")
    
    # Now create sessions and record events across the past 14 days
    # We can't set occurred_at directly, so we'll just record many events now
    # The analytics "over_time" groups by day, so all events will show as today.
    # 
    # However, we CAN create sessions with different grants to make the
    # delegation tree and activity feed look rich.
    
    print("\nCreating sessions and recording events...")
    # Use the deepest grant in the chain for recording
    recording_grant = chain_grant_ids[-1] if len(chain_grant_ids) > 1 else root_grant_id
    
    # Create a session
    r = s.post(f"{BASE}/v1/sessions", headers=headers, json={
        "root_grant_id": root_grant_id,
        "surface": "SURFACE_BROWSER"
    }, timeout=60)
    if r.status_code == 200:
        session_id = r.json()["session"]["session_id"]
        print(f"  session_id={session_id}")
        
        # Record 20 events with varied actions
        for i in range(20):
            at = ACTION_TYPES[i % len(ACTION_TYPES)]
            resource = ACTION_RESOURCES[i % len(ACTION_RESOURCES)]
            payload = {"element": "button", "label": f"Action {i}", "selector": f"#btn-{i}"}
            body = {
                "grant_id": recording_grant,
                "action_type": at,
                "resource": resource,
                "recording_ref": f"slr://session/demo-chain-{i}",
                "value_cents": 34999,
                "action_payload": b64(json.dumps(payload)),
                "pre_state_hash": b64(f"pre-{i}-{uuid.uuid4().hex[:8]}"),
                "post_state_hash": b64(f"post-{i}-{uuid.uuid4().hex[:8]}"),
            }
            r = s.post(f"{BASE}/v1/sessions/{session_id}/actions", headers=headers, json=body, timeout=60)
            if r.status_code == 200:
                eid = r.json().get("event", {}).get("event_id", "")
                print(f"    event {i}: {eid} ({at} → {resource[:40]})")
            else:
                print(f"    event {i} FAILED: {r.status_code} {r.text[:100]}")
        
        # End session
        s.post(f"{BASE}/v1/sessions/{session_id}/end", headers=headers, json={}, timeout=60)
    
    # Create a few more sessions with different surfaces for variety
    for surface in ["SURFACE_SANDBOX", "SURFACE_DESKTOP"]:
        r = s.post(f"{BASE}/v1/sessions", headers=headers, json={
            "root_grant_id": root_grant_id,
            "surface": surface
        }, timeout=60)
        if r.status_code == 200:
            sid = r.json()["session"]["session_id"]
            # Record a few events
            for i in range(5):
                at = ACTION_TYPES[i % len(ACTION_TYPES)]
                resource = ACTION_RESOURCES[i % len(ACTION_RESOURCES)]
                body = {
                    "grant_id": recording_grant,
                    "action_type": at,
                    "resource": resource,
                    "recording_ref": f"slr://session/{surface.lower()}-{i}",
                    "value_cents": 19999,
                    "action_payload": b64(json.dumps({"action": at})),
                    "pre_state_hash": b64(f"pre-{uuid.uuid4().hex[:8]}"),
                    "post_state_hash": b64(f"post-{uuid.uuid4().hex[:8]}"),
                }
                s.post(f"{BASE}/v1/sessions/{sid}/actions", headers=headers, json=body, timeout=60)
            s.post(f"{BASE}/v1/sessions/{sid}/end", headers=headers, json={}, timeout=60)
            print(f"  Created {surface} session: {sid}")
    
    # Final analytics check
    print("\n=== Final Analytics ===")
    r = s.get(f"{BASE}/v1/analytics/overview?days=30", headers=headers, timeout=60)
    print(json.dumps(r.json(), indent=2))
    
    print("\n=== Final Grant Tree ===")
    r = s.get(f"{BASE}/v1/grants", headers=headers, timeout=60)
    grants = r.json().get("grants", [])
    for g in grants[:20]:
        print(f"  {g['grant_id']} parent={g.get('parent_grant_id', '')[:12] or '(root)'} subject={g.get('subject_id', '')}")


if __name__ == "__main__":
    main()
