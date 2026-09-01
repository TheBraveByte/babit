package main

import (
	"os"

	"github.com/spf13/cobra"
)

func main() {
	root := &cobra.Command{
		Use:           "babit",
		Short:         "Notarized Action Ledger receipts",
		SilenceUsage:  true,
		SilenceErrors: true,
	}
	root.AddCommand(verifyCmd(), fetchCmd())
	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}
