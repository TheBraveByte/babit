package ports

import (
	"context"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
)

type Notarizer interface {
	Notarize(ctx context.Context, draft *ledgerv1.ActionEvent) (*ledgerv1.ActionEvent, error)
}

type Signer interface {
	Sign(msg []byte) (sig []byte, keyID string, err error)
	Verify(msg, sig []byte, keyID string) bool
	PublicKey(keyID string) ([]byte, bool)
}

type Sealer interface {
	Seal(event, prev *ledgerv1.ActionEvent) (*ledgerv1.ActionEvent, error)
	VerifyLink(event, prev *ledgerv1.ActionEvent) error
}

type MerkleTree interface {
	Root(leaves [][]byte) []byte
	Path(leaves [][]byte, index int) ([][]byte, error)
	Verify(leaf []byte, path [][]byte, root []byte, index int) bool
}

type DelegationVerifier interface {
	VerifyChain(chain []*ledgerv1.Grant, now time.Time) error
	Authorizes(grant *ledgerv1.Grant, capability, resource string, valueCents int64) error
}
