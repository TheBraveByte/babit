package interceptor

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"

	"github.com/chromedp/chromedp"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	solarisdk "github.com/solari-sdk/solari-browser-go"
)

type Browser struct {
	capture      ledgerv1.CaptureServiceClient
	solari       *solarisdk.Client
	session      *solarisdk.Session
	chrome       context.Context
	cancel       context.CancelFunc
	nalSession   string
	grantID      string
	recordingRef string
}

func NewBrowser(ctx context.Context, capture ledgerv1.CaptureServiceClient, sdk *solarisdk.Client, rootGrantID, grantID string) (*Browser, error) {
	session, err := sdk.Sessions.Create(ctx, solarisdk.CreateSessionOptions{Recording: true})
	if err != nil {
		return nil, fmt.Errorf("create solari session: %w", err)
	}
	chromeCtx, cancel, err := solarisdk.Connect(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("connect browser: %w", err)
	}
	begun, err := capture.BeginSession(ctx, &ledgerv1.BeginSessionRequest{
		RootGrantId: rootGrantID,
		Surface:     ledgerv1.Surface_SURFACE_BROWSER,
	})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("begin capture session: %w", err)
	}
	return &Browser{
		capture:      capture,
		solari:       sdk,
		session:      session,
		chrome:       chromeCtx,
		cancel:       cancel,
		nalSession:   begun.GetSession().GetSessionId(),
		grantID:      grantID,
		recordingRef: "slr://session/" + session.ID,
	}, nil
}

func (b *Browser) Navigate(ctx context.Context, url string) (*ledgerv1.ActionEvent, error) {
	return b.do(ctx, "browser.navigate", map[string]string{"url": url}, chromedp.Navigate(url))
}

func (b *Browser) Click(ctx context.Context, selector string) (*ledgerv1.ActionEvent, error) {
	return b.do(ctx, "browser.click", map[string]string{"selector": selector}, chromedp.Click(selector, chromedp.ByQuery))
}

func (b *Browser) Type(ctx context.Context, selector, text string) (*ledgerv1.ActionEvent, error) {
	return b.do(ctx, "browser.type", map[string]string{"selector": selector, "text": text}, chromedp.SendKeys(selector, text, chromedp.ByQuery))
}

func (b *Browser) do(ctx context.Context, actionType string, args map[string]string, action chromedp.Action) (*ledgerv1.ActionEvent, error) {
	pre := b.screenshotHash()
	if err := chromedp.Run(b.chrome, action); err != nil {
		return nil, fmt.Errorf("run %s: %w", actionType, err)
	}
	post := b.screenshotHash()
	payload, err := json.Marshal(args)
	if err != nil {
		return nil, fmt.Errorf("marshal payload: %w", err)
	}
	resp, err := b.capture.RecordAction(ctx, &ledgerv1.RecordActionRequest{
		SessionId:     b.nalSession,
		GrantId:       b.grantID,
		ActionType:    actionType,
		ActionPayload: payload,
		PreStateHash:  pre,
		PostStateHash: post,
		RecordingRef:  b.recordingRef,
	})
	if err != nil {
		return nil, fmt.Errorf("record %s: %w", actionType, err)
	}
	return resp.GetEvent(), nil
}

func (b *Browser) screenshotHash() []byte {
	var buf []byte
	if err := chromedp.Run(b.chrome, chromedp.CaptureScreenshot(&buf)); err != nil {
		return nil
	}
	sum := sha256.Sum256(buf)
	return sum[:]
}

func (b *Browser) Close(ctx context.Context) error {
	b.cancel()
	if _, err := b.capture.EndSession(ctx, &ledgerv1.EndSessionRequest{SessionId: b.nalSession}); err != nil {
		return fmt.Errorf("end capture session: %w", err)
	}
	if err := b.solari.Sessions.Release(ctx, b.session.ID); err != nil {
		return fmt.Errorf("release solari session: %w", err)
	}
	return nil
}
