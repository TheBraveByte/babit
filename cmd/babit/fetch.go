package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/receipt"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

func fetchCmd() *cobra.Command {
	var addr, eventID, apiKey, out string
	cmd := &cobra.Command{
		Use:   "fetch",
		Short: "Fetch a portable receipt for an event from nald",
		RunE: func(cmd *cobra.Command, args []string) error {
			if eventID == "" {
				return fmt.Errorf("--event is required")
			}
			conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				return fmt.Errorf("dial nald: %w", err)
			}
			defer conn.Close()

			ctx := context.Background()
			if apiKey != "" {
				ctx = metadata.AppendToOutgoingContext(ctx, "x-api-key", apiKey)
			}
			pr, err := ledgerv1.NewLedgerServiceClient(conn).GetInclusionProof(ctx, &ledgerv1.GetInclusionProofRequest{EventId: eventID})
			if err != nil {
				return fmt.Errorf("get proof: %w", err)
			}
			pk, err := ledgerv1.NewNotaryServiceClient(conn).GetPublicKey(ctx, &ledgerv1.GetPublicKeyRequest{})
			if err != nil {
				return fmt.Errorf("get public key: %w", err)
			}
			r, err := receipt.Build(pr.GetProof(), pk.GetKeyId(), pk.GetPublicKey())
			if err != nil {
				return err
			}
			data, err := json.MarshalIndent(r, "", "  ")
			if err != nil {
				return fmt.Errorf("encode receipt: %w", err)
			}
			if out == "" {
				fmt.Fprintln(cmd.OutOrStdout(), string(data))
				return nil
			}
			return os.WriteFile(out, data, 0o644)
		},
	}
	cmd.Flags().StringVar(&addr, "grpc", "localhost:9090", "nald gRPC address")
	cmd.Flags().StringVar(&eventID, "event", "", "event id to fetch a receipt for")
	cmd.Flags().StringVar(&apiKey, "api-key", "", "x-api-key for nald if enabled")
	cmd.Flags().StringVar(&out, "out", "", "output file (default stdout)")
	return cmd
}
