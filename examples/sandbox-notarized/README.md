# sandbox-notarized

Runs commands and code in a real Solari sandbox microVM and notarizes each through NAL.

`interceptor.Sandbox` wraps `solari-sandbox-go`: every `Exec` (`Commands.Run`) and
`RunCode` (`Code.Run`) drives the real sandbox, digests the output as the event's
`post_state_hash`, and emits a signed `RecordAction` to `nald` tagged with the sandbox id
(`slr://sandbox/<id>`).

## Run

```sh
make db-up
make run &
export SOLARI_API_KEY=slr_live_...
export SOLARI_SANDBOX_URL=https://gw.getsolari.com   # gateway origin
export NAL_GRPC=localhost:9090
go run ./examples/sandbox-notarized
```

Prints the notarized event id, sequence, exit code, and stdout.
