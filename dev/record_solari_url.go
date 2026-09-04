//go:build ignore

package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/chromedp/chromedp"
	solarisdk "github.com/solari-sdk/solari-browser-go"
)

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("%s is required", key)
	}
	return v
}

type client struct {
	base  string
	token string
	http  *http.Client
}

func (c *client) do(method, path string, body any, target any) error {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return err
		}
		bodyReader = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, c.base+path, bodyReader)
	if err != nil {
		return err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("%s %s: %d %s", method, path, resp.StatusCode, string(b))
	}
	if target != nil {
		return json.NewDecoder(resp.Body).Decode(target)
	}
	return nil
}

func (c *client) login(email, password string) error {
	var out struct {
		Token string `json:"token"`
	}
	if err := c.do("POST", "/v1/auth/login", map[string]string{"email": email, "password": password}, &out); err != nil {
		return err
	}
	c.token = out.Token
	return nil
}

func (c *client) firstOrCreateProject() (string, error) {
	var out struct {
		Projects []struct {
			ID string `json:"id"`
		} `json:"projects"`
	}
	if err := c.do("GET", "/v1/projects", nil, &out); err != nil {
		return "", err
	}
	if len(out.Projects) > 0 {
		return out.Projects[0].ID, nil
	}
	var created struct {
		Project struct {
			ID string `json:"id"`
		} `json:"project"`
	}
	if err := c.do("POST", "/v1/projects", map[string]string{"name": "Demo"}, &created); err != nil {
		return "", err
	}
	return created.Project.ID, nil
}

func (c *client) createGrants(projectID string) (root, child string, err error) {
	var rootOut struct {
		Grant struct {
			GrantID string `json:"grant_id"`
		} `json:"grant"`
	}
	if err := c.do("POST", "/v1/grants:root", map[string]any{
		"principal_id": "usr_demo",
		"project_id":   projectID,
		"scope":        map[string]any{"max_depth": 3},
	}, &rootOut); err != nil {
		return "", "", err
	}
	var childOut struct {
		Grant struct {
			GrantID string `json:"grant_id"`
		} `json:"grant"`
	}
	if err := c.do("POST", "/v1/grants", map[string]any{
		"parent_grant_id": rootOut.Grant.GrantID,
		"subject_id":      "agt_demo",
		"capabilities":    []string{"browser.navigate", "browser.click", "browser.type", "browser.submit"},
		"scope":           map[string]any{},
	}, &childOut); err != nil {
		return "", "", err
	}
	return rootOut.Grant.GrantID, childOut.Grant.GrantID, nil
}

func (c *client) beginSession(rootGrantID, surface string) (string, error) {
	var out struct {
		Session struct {
			SessionID string `json:"session_id"`
		} `json:"session"`
	}
	if err := c.do("POST", "/v1/sessions", map[string]any{
		"root_grant_id": rootGrantID,
		"surface":       surface,
	}, &out); err != nil {
		return "", err
	}
	return out.Session.SessionID, nil
}

func (c *client) recordAction(sessionID, grantID, url, label, recordingRef string) (string, string, error) {
	payload, _ := json.Marshal(map[string]string{"url": url, "label": label})
	pre := make([]byte, 12)
	post := make([]byte, 12)
	rand.Read(pre)
	rand.Read(post)
	body := map[string]any{
		"grant_id":       grantID,
		"action_type":    "browser.navigate",
		"resource":       url,
		"recording_ref":  recordingRef,
		"action_payload": base64.StdEncoding.EncodeToString(payload),
		"pre_state_hash": base64.StdEncoding.EncodeToString([]byte("pre-" + fmt.Sprintf("%x", pre))),
		"post_state_hash": base64.StdEncoding.EncodeToString([]byte("post-" + fmt.Sprintf("%x", post))),
	}
	var out struct {
		Event struct {
			EventID  string `json:"event_id"`
			Sequence string `json:"sequence"`
		} `json:"event"`
	}
	if err := c.do("POST", fmt.Sprintf("/v1/sessions/%s/actions", sessionID), body, &out); err != nil {
		return "", "", err
	}
	return out.Event.EventID, out.Event.Sequence, nil
}

func (c *client) endSession(sessionID string) error {
	return c.do("POST", fmt.Sprintf("/v1/sessions/%s/end", sessionID), map[string]any{}, nil)
}

func main() {
	url := flag.String("url", "https://github.com/TheBraveByte/babit", "URL to navigate")
	label := flag.String("label", "Recorded via Solari", "Action label")
	surface := flag.String("surface", "SURFACE_BROWSER", "Surface type")
	babitBase := flag.String("babit-base", envOr("BABIT_BASE", "https://babit-1-0y9x.onrender.com"), "Babit API base URL")
	babitEmail := flag.String("babit-email", envOr("BABIT_EMAIL", ""), "Babit email")
	babitPassword := flag.String("babit-password", envOr("BABIT_PASSWORD", ""), "Babit password")
	projectID := flag.String("project-id", envOr("BABIT_PROJECT_ID", ""), "Babit project ID (optional)")
	solariAPIKey := flag.String("solari-api-key", envOr("SOLARI_API_KEY", ""), "Solari API key")
	solariBase := flag.String("solari-base", envOr("SOLARI_BASE_URL", "https://api.getsolari.com"), "Solari base URL")
	flag.Parse()

	if *babitEmail == "" || *babitPassword == "" {
		log.Fatal("BABIT_EMAIL and BABIT_PASSWORD are required")
	}
	if *solariAPIKey == "" {
		log.Fatal("SOLARI_API_KEY is required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	// Start Solari browser session.
	solariClient, err := solarisdk.NewClient(solarisdk.ClientOptions{APIKey: *solariAPIKey, BaseURL: *solariBase})
	if err != nil {
		log.Fatalf("solari client: %v", err)
	}
	session, err := solariClient.Sessions.Create(ctx, solarisdk.CreateSessionOptions{Recording: true})
	if err != nil {
		log.Fatalf("create solari session: %v", err)
	}
	fmt.Printf("solari session: %s\n", session.ID)

	browserCtx, cancelBrowser, err := solarisdk.Connect(ctx, session)
	if err != nil {
		_ = solariClient.Sessions.Release(ctx, session.ID)
		log.Fatalf("connect browser: %v", err)
	}

	if err := chromedp.Run(browserCtx,
		chromedp.Navigate(*url),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		cancelBrowser()
		_ = solariClient.Sessions.Release(ctx, session.ID)
		log.Fatalf("navigate: %v", err)
	}
	fmt.Printf("navigated %s\n", *url)
	cancelBrowser()
	if err := solariClient.Sessions.Release(ctx, session.ID); err != nil {
		log.Printf("release solari session: %v", err)
	}

	// Record in Babit.
	c := &client{base: *babitBase, http: &http.Client{Timeout: 60 * time.Second}}
	if err := c.login(*babitEmail, *babitPassword); err != nil {
		log.Fatalf("babit login: %v", err)
	}

	pid := *projectID
	if pid == "" {
		pid, err = c.firstOrCreateProject()
		if err != nil {
			log.Fatalf("project: %v", err)
		}
	}
	fmt.Printf("babit project: %s\n", pid)

	root, child, err := c.createGrants(pid)
	if err != nil {
		log.Fatalf("grants: %v", err)
	}
	fmt.Printf("root grant: %s\n", root)
	fmt.Printf("agent grant: %s\n", child)

	babitSession, err := c.beginSession(root, *surface)
	if err != nil {
		log.Fatalf("begin session: %v", err)
	}
	fmt.Printf("babit session: %s\n", babitSession)

	eventID, seq, err := c.recordAction(babitSession, child, *url, *label, "slr://session/"+session.ID)
	if err != nil {
		log.Fatalf("record action: %v", err)
	}
	fmt.Printf("event: %s seq=%s\n", eventID, seq)

	if err := c.endSession(babitSession); err != nil {
		log.Fatalf("end session: %v", err)
	}
	fmt.Println("session ended")
}
