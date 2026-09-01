package seal

import (
	"bytes"
	"crypto/sha256"
	"fmt"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/ports"
)

type sealer struct {
	signer ports.Signer
}

func New(s ports.Signer) ports.Sealer {
	return sealer{signer: s}
}

func zero32() []byte {
	return make([]byte, sha256.Size)
}

func prevHashOf(prev *ledgerv1.ActionEvent) []byte {
	if prev == nil {
		return zero32()
	}
	return prev.GetContentHash()
}

func (s sealer) Seal(event, prev *ledgerv1.ActionEvent) (*ledgerv1.ActionEvent, error) {
	sum := sha256.Sum256(canon.Event(event))
	event.ContentHash = sum[:]
	event.PrevHash = prevHashOf(prev)
	sig, _, err := s.signer.Sign(append(append([]byte(nil), event.ContentHash...), event.PrevHash...))
	if err != nil {
		return nil, fmt.Errorf("sign event: %w", err)
	}
	event.NotarySignature = sig
	return event, nil
}

func (s sealer) VerifyLink(event, prev *ledgerv1.ActionEvent) error {
	sum := sha256.Sum256(canon.Event(event))
	if !bytes.Equal(sum[:], event.GetContentHash()) {
		return fmt.Errorf("verify content hash: %w", errMismatch)
	}
	if !bytes.Equal(event.GetPrevHash(), prevHashOf(prev)) {
		return fmt.Errorf("verify prev hash: %w", errMismatch)
	}
	msg := append(append([]byte(nil), event.GetContentHash()...), event.GetPrevHash()...)
	if !s.signer.Verify(msg, event.GetNotarySignature(), signKeyID) {
		return fmt.Errorf("verify signature: %w", errMismatch)
	}
	return nil
}

const signKeyID = "nal-notary-1"

var errMismatch = fmt.Errorf("integrity check failed")
