package receipt

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/core/graph"
	"github.com/babit/nal/internal/core/merkle"
	"github.com/babit/nal/internal/core/sign"
	"google.golang.org/protobuf/encoding/protojson"
)

type Receipt struct {
	Proof     json.RawMessage `json:"proof"`
	KeyID     string          `json:"key_id"`
	PublicKey string          `json:"public_key"`
}

type Result struct {
	ContentIntact  bool
	SignatureValid bool
	Included       bool
	Anchored       bool
	AuthorityValid bool
	Verdict        bool
}

func Build(proof *ledgerv1.Proof, keyID string, publicKey []byte) (*Receipt, error) {
	raw, err := protojson.Marshal(proof)
	if err != nil {
		return nil, fmt.Errorf("marshal proof: %w", err)
	}
	return &Receipt{
		Proof:     raw,
		KeyID:     keyID,
		PublicKey: base64.StdEncoding.EncodeToString(publicKey),
	}, nil
}

func Verify(r *Receipt, now time.Time) (*Result, *ledgerv1.Proof, error) {
	var proof ledgerv1.Proof
	if err := protojson.Unmarshal(r.Proof, &proof); err != nil {
		return nil, nil, fmt.Errorf("parse proof: %w", err)
	}
	pub, err := base64.StdEncoding.DecodeString(r.PublicKey)
	if err != nil {
		return nil, nil, fmt.Errorf("decode public key: %w", err)
	}
	verifier := sign.VerifierFromPublicKey(r.KeyID, pub)
	ev := proof.GetEvent()

	content := sha256.Sum256(canon.Event(ev))
	res := &Result{}
	res.ContentIntact = bytes.Equal(content[:], ev.GetContentHash())

	signed := append(append([]byte{}, ev.GetContentHash()...), ev.GetPrevHash()...)
	res.SignatureValid = verifier.Verify(signed, ev.GetNotarySignature(), r.KeyID)

	res.Included = merkle.New().Verify(ev.GetContentHash(), proof.GetMerklePath(), proof.GetMerkleRoot(), int(ev.GetSequence()-1))

	res.Anchored = proof.GetAnchor() != nil && bytes.Equal(proof.GetAnchor().GetRoot(), proof.GetMerkleRoot())

	chain := proof.GetDelegationChain()
	res.AuthorityValid = len(chain) > 0 &&
		graph.New(verifier).VerifyChain(chain, now) == nil &&
		chain[len(chain)-1].GetGrantId() == ev.GetGrantId()

	res.Verdict = res.ContentIntact && res.SignatureValid && res.Included && res.Anchored && res.AuthorityValid
	return res, &proof, nil
}
