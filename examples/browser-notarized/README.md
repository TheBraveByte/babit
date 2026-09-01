# browser-notarized

Drives a real Solari cloud browser and notarizes every action through NAL.

Each `interceptor.Browser` call creates a recorded Solari session, runs the
`chromedp` action against it, screenshots before/after, and emits a signed
`RecordAction` to the running `nald` — so the delegation-anchored ledger and the
Solari rrweb replay describe the same run.

## Run

```sh
make db-up            # postgres for nald
make run &            # nald on :9090 (needs DATABASE_URL)
export SOLARI_API_KEY=slr_live_...   # from console.getsolari.com
export NAL_GRPC=localhost:9090
go run ./examples/browser-notarized
```

Prints the notarized event id + sequence. The Solari session id is stored as the
event's `recording_ref` (`slr://session/<id>`); after the session is released,
`ReplayService` / the solari adapter can `DownloadReplay` that id for the rrweb NDJSON.
