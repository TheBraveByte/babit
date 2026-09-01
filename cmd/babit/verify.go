package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/receipt"
	"github.com/spf13/cobra"
)

func verifyCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "verify <receipt.json>",
		Short: "Verify an action receipt offline",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			data, err := os.ReadFile(args[0])
			if err != nil {
				return fmt.Errorf("read receipt: %w", err)
			}
			var r receipt.Receipt
			if err := json.Unmarshal(data, &r); err != nil {
				return fmt.Errorf("parse receipt: %w", err)
			}
			res, proof, err := receipt.Verify(&r, time.Now())
			if err != nil {
				return err
			}
			out := cmd.OutOrStdout()
			printChain(out, proof)
			printCheck(out, "signature valid", res.SignatureValid)
			printCheck(out, "hash chain intact", res.ContentIntact)
			printCheck(out, "merkle proof valid", res.Included)
			printCheck(out, "external anchor valid", res.Anchored)
			printCheck(out, "delegation authority valid", res.AuthorityValid)
			if res.Verdict {
				fmt.Fprintln(out, "\nVERDICT: VERIFIED")
				return nil
			}
			fmt.Fprintln(out, "\nVERDICT: NOT VERIFIED")
			return errors.New("verification failed")
		},
	}
}

func printChain(out interface{ Write([]byte) (int, error) }, proof *ledgerv1.Proof) {
	ev := proof.GetEvent()
	fmt.Fprintf(out, "Action %s (seq %d, %s)\n", ev.GetEventId(), ev.GetSequence(), ev.GetActionType())
	fmt.Fprintf(out, "Recording: %s\n", ev.GetRecordingRef())
	fmt.Fprintln(out, "Delegation chain:")
	for i, g := range proof.GetDelegationChain() {
		fmt.Fprintf(out, "  %d. %s -> %s (%s)\n", i, g.GetPrincipalId(), g.GetSubjectId(), g.GetGrantId())
	}
	fmt.Fprintln(out)
}

func printCheck(out interface{ Write([]byte) (int, error) }, label string, ok bool) {
	mark := "x"
	if ok {
		mark = "OK"
	}
	fmt.Fprintf(out, "[%s] %s\n", mark, label)
}
