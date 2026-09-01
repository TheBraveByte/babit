package sign

import "testing"

func TestSignVerify(t *testing.T) {
	s, err := NewEd25519()
	if err != nil {
		t.Fatalf("new signer: %v", err)
	}
	msg := []byte("hello")
	sig, keyID, err := s.Sign(msg)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	if keyID != DefaultKeyID {
		t.Fatalf("keyID = %q want %q", keyID, DefaultKeyID)
	}
	cases := []struct {
		name  string
		msg   []byte
		sig   []byte
		keyID string
		want  bool
	}{
		{"valid", msg, sig, DefaultKeyID, true},
		{"tampered msg", []byte("hell0"), sig, DefaultKeyID, false},
		{"unknown key", msg, sig, "unknown", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := s.Verify(tc.msg, tc.sig, tc.keyID); got != tc.want {
				t.Fatalf("verify = %v want %v", got, tc.want)
			}
		})
	}
}

func TestPublicKey(t *testing.T) {
	s, err := NewEd25519()
	if err != nil {
		t.Fatalf("new signer: %v", err)
	}
	if _, ok := s.PublicKey(DefaultKeyID); !ok {
		t.Fatal("expected public key present")
	}
	if _, ok := s.PublicKey("missing"); ok {
		t.Fatal("expected missing key absent")
	}
}
