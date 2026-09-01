package service

import (
	"bytes"
	"context"
	"crypto/sha256"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/ports"
)

type Verify struct {
	ledgerv1.UnimplementedVerifyServiceServer
	signer   ports.Signer
	merkle   ports.MerkleTree
	verifier ports.DelegationVerifier
	clock    ports.Clock
}

func NewVerify(signer ports.Signer, merkle ports.MerkleTree, verifier ports.DelegationVerifier, clock ports.Clock) *Verify {
	return &Verify{signer: signer, merkle: merkle, verifier: verifier, clock: clock}
}

func (v *Verify) VerifyProof(ctx context.Context, req *ledgerv1.VerifyProofRequest) (*ledgerv1.VerifyProofResponse, error) {
	p := req.GetProof()
	ev := p.GetEvent()

	recomputed := sha256.Sum256(canon.Event(ev))
	chainIntact := bytes.Equal(recomputed[:], ev.GetContentHash())

	signed := append(append([]byte{}, ev.GetContentHash()...), ev.GetPrevHash()...)
	signatureValid := v.signer.Verify(signed, ev.GetNotarySignature(), "nal-notary-1")

	anchored := p.GetAnchor() != nil &&
		bytes.Equal(p.GetAnchor().GetRoot(), p.GetMerkleRoot()) &&
		v.merkle.Verify(ev.GetContentHash(), p.GetMerklePath(), p.GetMerkleRoot(), int(ev.GetSequence()-1))

	authorityValid := v.authority(p.GetDelegationChain(), ev.GetGrantId())

	valid := chainIntact && signatureValid && authorityValid
	return &ledgerv1.VerifyProofResponse{
		Valid:          valid,
		ChainIntact:    chainIntact,
		SignatureValid: signatureValid,
		Anchored:       anchored,
		AuthorityValid: authorityValid,
		Reason:         proofReason(chainIntact, signatureValid, authorityValid),
	}, nil
}

func (v *Verify) authority(chain []*ledgerv1.Grant, grantID string) bool {
	if len(chain) == 0 {
		return false
	}
	if v.verifier.VerifyChain(chain, v.clock.Now()) != nil {
		return false
	}
	return chain[len(chain)-1].GetGrantId() == grantID
}

func proofReason(chainIntact, signatureValid, authorityValid bool) string {
	switch {
	case !chainIntact:
		return "content hash mismatch"
	case !signatureValid:
		return "notary signature invalid"
	case !authorityValid:
		return "delegation authority invalid"
	default:
		return ""
	}
}
