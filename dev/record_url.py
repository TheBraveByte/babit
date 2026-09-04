#!/usr/bin/env python3
"""Record one or more real URLs as a single Babit browser session.

Usage:
  BABIT_EMAIL=you@example.com BABIT_PASSWORD=secret \
  python dev/record_url.py "https://example.com/path" \
    --recording-ref "slr://session/<solari-session-id>"

If no project or grants are supplied, the script creates a project and issues
a fresh root grant, so it can be run stand-alone against the live backend.
"""

import argparse
import base64
import json
import os
import uuid

import requests

BASE = os.environ.get("BABIT_BASE", "https://babit-1-0y9x.onrender.com")
EMAIL = os.environ.get("BABIT_EMAIL", "")
PASSWORD = os.environ.get("BABIT_PASSWORD", "")


def b64(s: str) -> str:
    return base64.b64encode(s.encode()).decode()


def first_or_create_project(s: requests.Session, base: str, h: dict) -> str:
    r = s.get(f"{base}/v1/projects", headers=h, timeout=60)
    r.raise_for_status()
    projects = r.json().get("projects", [])
    if projects:
        return projects[0]["id"]
    r = s.post(f"{base}/v1/projects", headers=h, json={"name": "Demo"}, timeout=60)
    r.raise_for_status()
    return r.json()["project"]["id"]


def create_grants(s: requests.Session, base: str, h: dict, project_id: str):
    r = s.post(
        f"{base}/v1/grants:root",
        headers=h,
        json={"principal_id": "usr_demo", "project_id": project_id, "scope": {"max_depth": 3}},
        timeout=60,
    )
    r.raise_for_status()
    root = r.json()["grant"]["grant_id"]

    r = s.post(
        f"{base}/v1/grants",
        headers=h,
        json={
            "parent_grant_id": root,
            "subject_id": "agt_demo",
            "capabilities": ["browser.navigate", "browser.click", "browser.type", "browser.submit"],
            "scope": {},
        },
        timeout=60,
    )
    r.raise_for_status()
    child = r.json()["grant"]["grant_id"]
    return root, child


def record_action(s: requests.Session, base: str, h: dict, session_id: str,
                  grant_id: str, action_type: str, url: str, label: str,
                  recording_ref: str):
    payload = json.dumps({"url": url, "label": label})
    body = {
        "grant_id": grant_id,
        "action_type": action_type,
        "resource": url,
        "recording_ref": recording_ref,
        "action_payload": b64(payload),
        "pre_state_hash": b64(f"pre-{uuid.uuid4().hex[:8]}"),
        "post_state_hash": b64(f"post-{uuid.uuid4().hex[:8]}"),
    }
    r = s.post(
        f"{base}/v1/sessions/{session_id}/actions",
        headers=h,
        json=body,
        timeout=60,
    )
    r.raise_for_status()
    event = r.json()["event"]
    print(f"  recorded {event['event_id']} seq={event['sequence']} {action_type} → {url}")
    return event


def main():
    parser = argparse.ArgumentParser(description="Record real URLs in Babit.")
    parser.add_argument("urls", nargs="+", help="URLs to record")
    parser.add_argument("--email", default=EMAIL)
    parser.add_argument("--password", default=PASSWORD)
    parser.add_argument("--base", default=BASE)
    parser.add_argument("--project-id")
    parser.add_argument("--root-grant-id")
    parser.add_argument("--grant-id")
    parser.add_argument("--recording-ref", default="")
    parser.add_argument("--surface", default="SURFACE_BROWSER")
    args = parser.parse_args()

    if not args.email or not args.password:
        parser.error("BABIT_EMAIL and BABIT_PASSWORD are required")

    session = requests.Session()
    r = session.post(
        f"{args.base}/v1/auth/login",
        json={"email": args.email, "password": args.password},
        timeout=60,
    )
    r.raise_for_status()
    token = r.json()["token"]
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    project_id = args.project_id or first_or_create_project(session, args.base, h)
    print(f"project: {project_id}")

    if args.root_grant_id and args.grant_id:
        root, child = args.root_grant_id, args.grant_id
    else:
        root, child = create_grants(session, args.base, h, project_id)
    print(f"root grant: {root}")
    print(f"agent grant: {child}")

    r = session.post(
        f"{args.base}/v1/sessions",
        headers=h,
        json={"root_grant_id": root, "surface": args.surface},
        timeout=60,
    )
    r.raise_for_status()
    session_id = r.json()["session"]["session_id"]
    print(f"session: {session_id}")

    for url in args.urls:
        record_action(
            session, args.base, h, session_id, child,
            "browser.navigate", url, "Recorded URL", args.recording_ref,
        )

    session.post(f"{args.base}/v1/sessions/{session_id}/end", headers=h, json={}, timeout=60)
    print("session ended")


if __name__ == "__main__":
    main()
