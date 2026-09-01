package interceptor

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	sandboxsdk "github.com/solari-sdk/solari-sandbox-go"
)

type Sandbox struct {
	capture      ledgerv1.CaptureServiceClient
	client       *sandboxsdk.Client
	box          *sandboxsdk.Sandbox
	nalSession   string
	grantID      string
	recordingRef string
}

func NewSandbox(ctx context.Context, capture ledgerv1.CaptureServiceClient, sdk *sandboxsdk.Client, rootGrantID, grantID string) (*Sandbox, error) {
	box, err := sdk.Create(ctx, sandboxsdk.CreateOptions{})
	if err != nil {
		return nil, fmt.Errorf("create sandbox: %w", err)
	}
	if err := box.Connect(ctx); err != nil {
		return nil, fmt.Errorf("connect sandbox: %w", err)
	}
	begun, err := capture.BeginSession(ctx, &ledgerv1.BeginSessionRequest{
		RootGrantId: rootGrantID,
		Surface:     ledgerv1.Surface_SURFACE_SANDBOX,
	})
	if err != nil {
		return nil, fmt.Errorf("begin capture session: %w", err)
	}
	return &Sandbox{
		capture:      capture,
		client:       sdk,
		box:          box,
		nalSession:   begun.GetSession().GetSessionId(),
		grantID:      grantID,
		recordingRef: "slr://sandbox/" + box.ID,
	}, nil
}

func (s *Sandbox) Exec(ctx context.Context, cmd string, args ...string) (*ledgerv1.ActionEvent, *sandboxsdk.CommandResult, error) {
	res, err := s.box.Commands.Run(ctx, cmd, sandboxsdk.CommandOptions{Args: args})
	if err != nil {
		return nil, nil, fmt.Errorf("run command: %w", err)
	}
	post := digest(fmt.Sprintf("%d\n%s\n%s", res.ExitCode, res.Stdout, res.Stderr))
	payload, err := json.Marshal(map[string]any{"cmd": cmd, "args": args, "exit_code": res.ExitCode})
	if err != nil {
		return nil, nil, fmt.Errorf("marshal payload: %w", err)
	}
	event, err := s.record(ctx, "sandbox.exec", payload, post)
	if err != nil {
		return nil, nil, err
	}
	return event, res, nil
}

func (s *Sandbox) RunCode(ctx context.Context, code, language string) (*ledgerv1.ActionEvent, *sandboxsdk.RunCodeResult, error) {
	res, err := s.box.Code.Run(ctx, code, sandboxsdk.RunCodeOptions{Language: language})
	if err != nil {
		return nil, nil, fmt.Errorf("run code: %w", err)
	}
	encoded, err := json.Marshal(res)
	if err != nil {
		return nil, nil, fmt.Errorf("encode code result: %w", err)
	}
	payload, err := json.Marshal(map[string]any{"language": language, "code": code})
	if err != nil {
		return nil, nil, fmt.Errorf("marshal payload: %w", err)
	}
	event, err := s.record(ctx, "sandbox.code", payload, digest(string(encoded)))
	if err != nil {
		return nil, nil, err
	}
	return event, res, nil
}

func (s *Sandbox) record(ctx context.Context, actionType string, payload, post []byte) (*ledgerv1.ActionEvent, error) {
	resp, err := s.capture.RecordAction(ctx, &ledgerv1.RecordActionRequest{
		SessionId:     s.nalSession,
		GrantId:       s.grantID,
		ActionType:    actionType,
		ActionPayload: payload,
		PostStateHash: post,
		RecordingRef:  s.recordingRef,
	})
	if err != nil {
		return nil, fmt.Errorf("record %s: %w", actionType, err)
	}
	return resp.GetEvent(), nil
}

func (s *Sandbox) Close(ctx context.Context) error {
	if _, err := s.capture.EndSession(ctx, &ledgerv1.EndSessionRequest{SessionId: s.nalSession}); err != nil {
		return fmt.Errorf("end capture session: %w", err)
	}
	if err := s.client.Kill(ctx, s.box.ID); err != nil {
		return fmt.Errorf("kill sandbox: %w", err)
	}
	return nil
}

func digest(s string) []byte {
	sum := sha256.Sum256([]byte(s))
	return sum[:]
}
