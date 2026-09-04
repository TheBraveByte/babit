package service

import (
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/grpc"
)

type Replay struct {
	ledgerv1.UnimplementedReplayServiceServer
	events   ports.EventStore
	sessions ports.SessionStore
	projects ports.ProjectStore
	solari   ports.Solari
}

func NewReplay(events ports.EventStore, sessions ports.SessionStore, projects ports.ProjectStore, solari ports.Solari) *Replay {
	return &Replay{events: events, sessions: sessions, projects: projects, solari: solari}
}

func (r *Replay) GetReplay(req *ledgerv1.GetReplayRequest, stream grpc.ServerStreamingServer[ledgerv1.GetReplayResponse]) error {
	ctx := stream.Context()
	session, err := r.sessions.Get(ctx, req.GetSessionId())
	if err != nil {
		return errs.GRPCStatus(errs.Wrap(errs.NotFound, err, "session"))
	}
	if err := ensureProjectAccess(ctx, session.GetProjectId(), r.projects); err != nil {
		return errs.GRPCStatus(err)
	}

	events, err := r.events.BySession(ctx, req.GetSessionId())
	if err != nil {
		return errs.GRPCStatus(errs.Wrap(errs.NotFound, err, "session events"))
	}
	for _, ev := range events {
		var frame []byte
		if b, ferr := r.solari.Recording(ctx, ev.GetRecordingRef()); ferr == nil {
			frame = b
		}
		if err := stream.Send(&ledgerv1.GetReplayResponse{Event: ev, Frame: frame}); err != nil {
			return errs.GRPCStatus(errs.Wrap(errs.Internal, err, "send frame"))
		}
	}
	return nil
}
