package sign

import (
	"crypto/ed25519"
	"crypto/rand"
	"fmt"
)

const DefaultKeyID = "nal-notary-1"

type Signer struct {
	keyID string
	priv  ed25519.PrivateKey
	pubs  map[string]ed25519.PublicKey
}

func NewEd25519() (*Signer, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("generate keypair: %w", err)
	}
	return &Signer{
		keyID: DefaultKeyID,
		priv:  priv,
		pubs:  map[string]ed25519.PublicKey{DefaultKeyID: pub},
	}, nil
}

func (s *Signer) Sign(msg []byte) ([]byte, string, error) {
	sig := ed25519.Sign(s.priv, msg)
	return sig, s.keyID, nil
}

func (s *Signer) Verify(msg, sig []byte, keyID string) bool {
	pub, ok := s.pubs[keyID]
	if !ok {
		return false
	}
	return ed25519.Verify(pub, msg, sig)
}

func (s *Signer) PublicKey(keyID string) ([]byte, bool) {
	pub, ok := s.pubs[keyID]
	if !ok {
		return nil, false
	}
	return append([]byte(nil), pub...), true
}
