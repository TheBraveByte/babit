#!/usr/bin/env python3
"""
Babit end-to-end API verification.

Runs N requests per endpoint across the full ledger flow against a live
backend, reporting per-endpoint latency, status codes, and failures.

Account: yusufakinleye144@gmail.com / babit-demo-1234
Usage:   python3 dev/babit_e2e.py [--base-url URL] [--requests N]
"""

import argparse
import base64
import json
import sys
import time
import uuid

import requests

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_BASE = "https://babit-1-0y9x.onrender.com"
DEFAULT_N = 25

EMAIL_BASE = "yusufakinleye144@gmail.com"
PASSWORD = "babit-demo-1234"

ORG_NAME = "Brave Byte Labs"
ORG_DOMAIN = "bravebyte.io"
INDUSTRY = "software"

# Sensible agent + action context used across capture calls.
# The scenario: an AI shopping agent navigates Best Buy, adds a product to
# cart, fills in shipping details, and completes checkout.  All URLs and
# product references are real, well-known pages.
AGENT_SUBJECT = "agt_checkout_agent"
RESOURCE_BASE = "https://www.bestbuy.com"
RECORDING_REF = "slr://session/bestbuy-checkout-demo"

# Real Best Buy product pages the agent navigates through
PRODUCT_PAGES = [
    "https://www.bestbuy.com/site/sony-wh-1000xm5-wireless-headphones-black/6505840.p",
    "https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation-white/4915441.p",
    "https://www.bestbuy.com/site/samsung-galaxy-s24-ultra/6522341.p",
    "https://www.bestbuy.com/site/lg-c3-oled-tv/6515421.p",
    "https://www.bestbuy.com/site/bose-quietcomfort-headphones/6487420.p",
]

# Action types we cycle through for record-action
ACTION_TYPES = [
    "browser.navigate",
    "browser.click",
    "browser.type",
    "browser.scroll",
    "browser.submit",
]

CAPABILITIES = ["browser.click", "browser.type", "browser.navigate",
                "browser.submit", "browser.scroll"]

# ---------------------------------------------------------------------------
# Results collector
# ---------------------------------------------------------------------------

class Results:
    def __init__(self):
        self.rows = []  # (endpoint, method, total, ok, fail, p50, p95, max, errors)

    def record(self, endpoint, method, latencies, ok, fail, errors):
        s = sorted(latencies)
        n = len(s)
        p50 = s[n // 2] if n else 0
        p95 = s[int(n * 0.95)] if n else 0
        mx = s[-1] if n else 0
        self.rows.append((endpoint, method, ok + fail, ok, fail, p50, p95, mx, errors))

    def report(self):
        print("\n" + "=" * 105)
        print(f"{'Endpoint':<45} {'Method':<7} {'Total':>5} {'OK':>5} {'Fail':>5} "
              f"{'p50ms':>8} {'p95ms':>8} {'maxms':>8}")
        print("-" * 105)
        tok = tfail = 0
        for ep, m, total, ok, fail, p50, p95, mx, _ in self.rows:
            print(f"{ep:<45} {m:<7} {total:>5} {ok:>5} {fail:>5} "
                  f"{p50:>8.0f} {p95:>8.0f} {mx:>8.0f}")
            tok += ok
            tfail += fail
        print("-" * 105)
        print(f"{'TOTAL':<45} {'':<7} {tok+tfail:>5} {tok:>5} {tfail:>5}")
        print("=" * 105)
        if tfail:
            print(f"\n{tfail} request(s) failed — see errors above.")
            return 1
        print("\nAll requests succeeded.")
        return 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def b64(s: str) -> str:
    return base64.b64encode(s.encode()).decode()


def action_payload(i: int) -> dict:
    """Sensible, varied action payload for record-action call #i.

    Models a real AI checkout agent on Best Buy: navigate to a product,
    add to cart, fill shipping info, select payment, submit order.
    """
    actions = [
        {"element": "button", "label": "Add to Cart", "selector": "#add-to-cart-button",
         "product": "Sony WH-1000XM5", "sku": "6505840"},
        {"element": "input", "label": "Email Address", "selector": "#user.email-address",
         "value": "customer@gmail.com"},
        {"element": "input", "label": "Shipping Address Line 1",
         "selector": "#address.line1", "value": "350 Fifth Avenue"},
        {"element": "input", "label": "Shipping City", "selector": "#address.city",
         "value": "New York", "state": "NY", "zip": "10118"},
        {"element": "select", "label": "Payment Method", "selector": "#payment-type",
         "value": "visa", "last4": "4242"},
    ]
    return actions[i % len(actions)]


def hit(results, label, method, url, *, n, token=None, body=None, expect=200):
    """Hit one endpoint n times, recording latency and failures.

    Transient network errors (connection reset, timeout) get one retry
    with a brief backoff — these are common on Render's free tier and
    are not backend bugs.
    """
    latencies = []
    ok = fail = 0
    errors = set()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    for i in range(n):
        req_body = body(i) if callable(body) else body
        t0 = time.monotonic()
        resp = None
        last_exc = None
        for attempt in range(2):  # original + 1 retry on network error
            try:
                resp = requests.request(method, url, headers=headers,
                                        json=req_body, timeout=90)
                last_exc = None
                break
            except requests.RequestException as exc:
                last_exc = exc
                if attempt == 0:
                    time.sleep(1)
        dt = (time.monotonic() - t0) * 1000
        latencies.append(dt)
        if last_exc:
            fail += 1
            errors.add(f"[{i}] exc: {last_exc}")
        elif resp.status_code == expect:
            ok += 1
        else:
            fail += 1
            snippet = resp.text[:200] if resp.text else "(empty)"
            errors.add(f"[{i}] {resp.status_code}: {snippet}")

    for e in errors:
        print(f"  ! {label} {e}")
    results.record(label, method, latencies, ok, fail, errors)
    return ok, fail


def once(method, url, *, token=None, body=None, expect=200):
    """Single request with one retry on network error, return parsed JSON."""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    last_exc = None
    for attempt in range(3):
        try:
            resp = requests.request(method, url, headers=headers, json=body,
                                    timeout=90)
            if resp.status_code != expect:
                raise RuntimeError(f"{method} {url} -> {resp.status_code}: "
                                   f"{resp.text[:400]}")
            return resp.json()
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(1)
    raise RuntimeError(f"{method} {url} -> network error after retries: {last_exc}")


def extract(obj, *keys):
    """Try multiple key names (camelCase / snake_case) and return first match."""
    for k in keys:
        if k in obj and obj[k]:
            return obj[k]
    return ""


# ---------------------------------------------------------------------------
# Main flow
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Babit e2e API verification")
    ap.add_argument("--base-url", default=DEFAULT_BASE)
    ap.add_argument("--requests", type=int, default=DEFAULT_N)
    args = ap.parse_args()

    base = args.base_url.rstrip("/")
    n = args.requests
    R = Results()

    print(f"Babit e2e — {base}")
    print(f"Account: {EMAIL_BASE}")
    print(f"Requests per endpoint: {n}\n")

    # The API uses snake_case JSON (confirmed from frontend schema.d.ts).
    # We tag the local-part with a run-id so repeated runs don't collide on
    # the email unique-constraint.  The base identity is still
    # yusufakinleye144@gmail.com (plus-tagged).
    run_id = uuid.uuid4().hex[:8]
    email = f"yusufakinleye144+e2e-{run_id}@gmail.com"

    # ---- 1. Signup -----------------------------------------------------------
    # Signup is the only endpoint that enforces a unique constraint (email),
    # so the load-test loop uses a unique email per request.  We grab the
    # token from a separate single signup first.
    print("[1/13] Signup")
    signup_body = {
        "email": email,
        "password": PASSWORD,
        "account_type": "ACCOUNT_TYPE_ORGANIZATION",
        "org_name": ORG_NAME,
        "org_domain": ORG_DOMAIN,
        "industry": INDUSTRY,
    }
    sr = once("POST", f"{base}/v1/auth/signup", body=signup_body)
    token = sr.get("token", "")
    user = sr.get("user", {})
    user_id = user.get("id", "")
    print(f"  user_id={user_id}  token={'yes' if token else 'NO'}")
    if not token:
        print("FATAL: no token from signup.")
        sys.exit(1)

    # Load-test signup with unique emails per request
    hit(R, "/v1/auth/signup", "POST", f"{base}/v1/auth/signup", n=n,
        body=lambda i: {
            "email": f"yusufakinleye144+e2e-{run_id}-s{i}@gmail.com",
            "password": PASSWORD,
            "account_type": "ACCOUNT_TYPE_ORGANIZATION",
            "org_name": ORG_NAME,
            "org_domain": ORG_DOMAIN,
            "industry": INDUSTRY,
        })

    # ---- 2. Login ------------------------------------------------------------
    print("[2/13] Login")
    hit(R, "/v1/auth/login", "POST", f"{base}/v1/auth/login", n=n,
        body={"email": email, "password": PASSWORD})

    # ---- 3. Me ---------------------------------------------------------------
    print("[3/13] Me")
    hit(R, "/v1/auth/me", "GET", f"{base}/v1/auth/me", n=n, token=token)

    # ---- 4. Update profile ---------------------------------------------------
    print("[4/13] UpdateProfile")
    hit(R, "/v1/auth/me (PATCH)", "PATCH", f"{base}/v1/auth/me", n=n, token=token,
        body={"org_name": f"{ORG_NAME} (verified)", "org_domain": ORG_DOMAIN,
              "industry": INDUSTRY})

    # ---- 5. Projects ---------------------------------------------------------
    print("[5/13] CreateProject + ListProjects")
    pr = once("POST", f"{base}/v1/projects", token=token,
              body={"name": "Agent Operations"})
    project_id = extract(pr.get("project", {}), "id")
    print(f"  project_id={project_id}")

    hit(R, "/v1/projects (POST)", "POST", f"{base}/v1/projects", n=n, token=token,
        body=lambda i: {"name": f"Load Test Project {i}"})
    hit(R, "/v1/projects (GET)", "GET", f"{base}/v1/projects", n=n, token=token)

    # ---- 6. API keys ---------------------------------------------------------
    print("[6/13] CreateApiKey + ListApiKeys + Revoke")
    kr = once("POST", f"{base}/v1/projects/{project_id}/keys", token=token,
              body={"name": "Production Capture Key"})
    key_id = extract(kr.get("key", {}), "id")
    print(f"  key_id={key_id}")

    hit(R, "/v1/projects/{id}/keys (POST)", "POST",
        f"{base}/v1/projects/{project_id}/keys", n=n, token=token,
        body=lambda i: {"name": f"Key {i}", "project_id": project_id})
    hit(R, "/v1/projects/{id}/keys (GET)", "GET",
        f"{base}/v1/projects/{project_id}/keys", n=n, token=token)
    if key_id:
        hit(R, "/v1/keys/{id}/revoke", "POST", f"{base}/v1/keys/{key_id}/revoke",
            n=1, token=token, body={})

    # ---- 7. Root grant -------------------------------------------------------
    print("[7/13] IssueRootGrant")
    gr = once("POST", f"{base}/v1/grants:root", token=token,
              body={"principal_id": user_id, "scope": {"max_depth": 3}})
    root_grant_id = extract(gr.get("grant", {}), "grant_id", "grantId")
    print(f"  root_grant_id={root_grant_id}")

    hit(R, "/v1/grants:root", "POST", f"{base}/v1/grants:root", n=n, token=token,
        body=lambda i: {"principal_id": user_id, "scope": {"max_depth": 3}})

    # ---- 8. Delegate ---------------------------------------------------------
    print("[8/13] Delegate + VerifyChain + Revoke")
    delegate_body = {
        "parent_grant_id": root_grant_id,
        "subject_id": AGENT_SUBJECT,
        "capabilities": CAPABILITIES,
        "scope": {
            "resource_globs": [f"{RESOURCE_BASE}/*"],
            "max_value_cents": 50000,
            "max_depth": 2,
        },
    }
    dr = once("POST", f"{base}/v1/grants", token=token, body=delegate_body)
    delegated_id = extract(dr.get("grant", {}), "grant_id", "grantId")
    print(f"  delegated_grant_id={delegated_id}")

    hit(R, "/v1/grants (POST)", "POST", f"{base}/v1/grants", n=n, token=token,
        body=lambda i: {
            "parent_grant_id": root_grant_id,
            "subject_id": f"{AGENT_SUBJECT}-{i}",
            "capabilities": CAPABILITIES,
            "scope": {
                "resource_globs": [f"{RESOURCE_BASE}/*"],
                "max_value_cents": 50000,
                "max_depth": 2,
            },
        })

    if delegated_id:
        hit(R, "/v1/grants/{id}:verify", "GET",
            f"{base}/v1/grants/{delegated_id}:verify", n=n, token=token)
        hit(R, "/v1/grants/{id}/revoke", "POST",
            f"{base}/v1/grants/{delegated_id}/revoke", n=1, token=token,
            body={"reason": "e2e load test cleanup"})

    # ---- 9. Begin session ----------------------------------------------------
    print("[9/13] BeginSession")
    sr = once("POST", f"{base}/v1/sessions", token=token,
              body={"root_grant_id": root_grant_id, "surface": "SURFACE_BROWSER"})
    session_id = extract(sr.get("session", {}), "session_id", "sessionId")
    print(f"  session_id={session_id}")

    hit(R, "/v1/sessions (POST)", "POST", f"{base}/v1/sessions", n=n, token=token,
        body=lambda i: {"root_grant_id": root_grant_id, "surface": "SURFACE_BROWSER"})

    # ---- 10. Record actions --------------------------------------------------
    print("[10/13] RecordAction")
    # Issue a fresh delegated grant for recording (the earlier one may be revoked)
    fresh = once("POST", f"{base}/v1/grants", token=token,
                 body={
                     "parent_grant_id": root_grant_id,
                     "subject_id": f"{AGENT_SUBJECT}-rec",
                     "capabilities": CAPABILITIES,
                     "scope": {
                         "resource_globs": [f"{RESOURCE_BASE}/*"],
                         "max_value_cents": 50000,
                         "max_depth": 2,
                     },
                 })
    rec_grant_id = extract(fresh.get("grant", {}), "grant_id", "grantId")

    event_ids = []
    latencies = []
    ok = fail = 0
    errors = set()
    for i in range(n):
        at = ACTION_TYPES[i % len(ACTION_TYPES)]
        payload = action_payload(i)
        # Cycle through real Best Buy pages: product pages for navigate,
        # cart/checkout pages for the other actions
        if at == "browser.navigate":
            resource = PRODUCT_PAGES[i % len(PRODUCT_PAGES)]
        elif at == "browser.click":
            resource = "https://www.bestbuy.com/cart"
        elif at == "browser.type":
            resource = "https://www.bestbuy.com/checkout/r/info"
        elif at == "browser.scroll":
            resource = PRODUCT_PAGES[i % len(PRODUCT_PAGES)]
        else:  # browser.submit
            resource = "https://www.bestbuy.com/checkout/r/payment"
        body_i = {
            "grant_id": rec_grant_id,
            "action_type": at,
            "resource": resource,
            "recording_ref": RECORDING_REF,
            "value_cents": 34999,  # $349.99 — Sony WH-1000XM5 price
            "action_payload": b64(json.dumps(payload)),
            "pre_state_hash": b64(f"pre-{i}-{run_id}"),
            "post_state_hash": b64(f"post-{i}-{run_id}"),
        }
        t0 = time.monotonic()
        resp = None
        last_exc = None
        for attempt in range(2):
            try:
                resp = requests.post(f"{base}/v1/sessions/{session_id}/actions",
                                     headers={"Content-Type": "application/json",
                                              "Authorization": f"Bearer {token}"},
                                     json=body_i, timeout=90)
                last_exc = None
                break
            except requests.RequestException as exc:
                last_exc = exc
                if attempt == 0:
                    time.sleep(1)
        dt = (time.monotonic() - t0) * 1000
        latencies.append(dt)
        if last_exc:
            fail += 1
            errors.add(f"[{i}] exc: {last_exc}")
        elif resp.status_code == 200:
            ok += 1
            ev = resp.json().get("event", {})
            eid = extract(ev, "event_id", "eventId")
            if eid:
                event_ids.append(eid)
        else:
            fail += 1
            errors.add(f"[{i}] {resp.status_code}: {resp.text[:200]}")
    for e in errors:
        print(f"  ! /v1/sessions/{{id}}/actions {e}")
    R.record("/v1/sessions/{id}/actions", "POST", latencies, ok, fail, errors)

    # ---- 11. End session -----------------------------------------------------
    print("[11/13] EndSession")
    # End once — ending the same session n times would fail after the first.
    hit(R, "/v1/sessions/{id}/end", "POST", f"{base}/v1/sessions/{session_id}/end",
        n=1, token=token, body={})

    # ---- 12. Ledger + verify + notary ---------------------------------------
    print("[12/13] GetEvent + InclusionProof + VerifyProof + Anchor + PublicKey")
    if event_ids:
        eid = event_ids[0]
        hit(R, "/v1/events/{id}", "GET", f"{base}/v1/events/{eid}", n=n, token=token)
        hit(R, "/v1/events/{id}:proof", "GET", f"{base}/v1/events/{eid}:proof",
            n=n, token=token)
        proof = once("GET", f"{base}/v1/events/{eid}:proof", token=token).get("proof", {})
        hit(R, "/v1/proofs:verify", "POST", f"{base}/v1/proofs:verify", n=n,
            token=token, body={"proof": proof})
    else:
        print("  (no event IDs captured — skipping ledger/verify)")
        R.record("/v1/events/{id}", "GET", [], 0, 0, set())
        R.record("/v1/events/{id}:proof", "GET", [], 0, 0, set())
        R.record("/v1/proofs:verify", "POST", [], 0, 0, set())

    hit(R, "/v1/sessions/{id}/anchor", "GET",
        f"{base}/v1/sessions/{session_id}/anchor", n=n, token=token)
    hit(R, "/v1/notary/public-key", "GET", f"{base}/v1/notary/public-key", n=n,
        token=token)

    # ---- 13. Analytics + Replay ---------------------------------------------
    print("[13/13] Analytics + Replay")
    hit(R, "/v1/analytics/overview", "GET", f"{base}/v1/analytics/overview?days=30",
        n=n, token=token)
    # Replay is server-streaming; grpc-gateway returns chunked JSON.
    hit(R, "/v1/sessions/{id}:replay", "GET",
        f"{base}/v1/sessions/{session_id}:replay", n=n, token=token)

    # ---- Report --------------------------------------------------------------
    sys.exit(R.report())


if __name__ == "__main__":
    main()
