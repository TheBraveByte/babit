
package pagination

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
)

type Cursor struct {
	Value string `json:"v"`
}

func (c Cursor) Encode() string {
	if c.Value == "" {
		return ""
	}
	b, err := json.Marshal(c)
	if err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}

func Decode(token string) (Cursor, error) {
	if token == "" {
		return Cursor{}, nil
	}
	b, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		return Cursor{}, fmt.Errorf("invalid page token: %w", err)
	}
	var c Cursor
	if err := json.Unmarshal(b, &c); err != nil {
		return Cursor{}, fmt.Errorf("invalid page token: %w", err)
	}
	return c, nil
}

func ClampPageSize(n, max int32) int32 {
	if n <= 0 || n > max {
		return max
	}
	return n
}
