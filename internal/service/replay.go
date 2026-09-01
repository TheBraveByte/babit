package service

import (
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Replay struct {
	ledgerv1.UnimplementedReplayServiceServer
	events ports.EventStore
	solari ports.Solari
}

func NewReplay(events ports.EventStore, solari ports.Solari) *Replay {
	return &Replay{events: events, solari: solari}
}

func (r *Replay) GetReplay(req *ledgerv1.GetReplayRequest, stream grpc.ServerStreamingServer[ledgerv1.GetReplayResponse]) error {
	ctx := stream.Context()
	events, err := r.events.BySession(ctx, req.GetSessionId())
	if err != nil {
		return status.Errorf(codes.NotFound, "session events: %v", err)
	}
	for _, ev := range events {
		var frame []byte
		if b, ferr := r.solari.Recording(ctx, ev.GetRecordingRef()); ferr == nil {
			frame = b
		}
		if err := stream.Send(&ledgerv1.GetReplayResponse{Event: ev, Frame: frame}); err != nil {
			return status.Errorf(codes.Internal, "send frame: %v", err)
		}
	}
	return nil
}
