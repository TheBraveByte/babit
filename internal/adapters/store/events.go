package store

import (
	"context"
	"errors"
	"fmt"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	storedb "github.com/babit/nal/db/sqlc"
	"github.com/jackc/pgx/v5"
)

type eventStore struct {
	q *storedb.Queries
}

func (s *eventStore) Append(ctx context.Context, event *ledgerv1.ActionEvent) error {
	if err := s.q.AppendEvent(ctx, storedb.AppendEventParams{
		EventID:         event.EventId,
		SessionID:       event.SessionId,
		Sequence:        event.Sequence,
		Surface:         int32(event.Surface),
		ActionType:      event.ActionType,
		ActionPayload:   event.ActionPayload,
		GrantID:         event.GrantId,
		PreStateHash:    event.PreStateHash,
		PostStateHash:   event.PostStateHash,
		RecordingRef:    event.RecordingRef,
		OccurredAt:      toTimestamptz(event.OccurredAt),
		ContentHash:     event.ContentHash,
		PrevHash:        event.PrevHash,
		NotarySignature: event.NotarySignature,
	}); err != nil {
		return fmt.Errorf("append event: %w", err)
	}
	return nil
}

func (s *eventStore) Get(ctx context.Context, eventID string) (*ledgerv1.ActionEvent, error) {
	row, err := s.q.GetEvent(ctx, eventID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("get event %s: %w", eventID, ErrNotFound)
		}
		return nil, fmt.Errorf("get event: %w", err)
	}
	return eventFromRow(row), nil
}

func (s *eventStore) Last(ctx context.Context, sessionID string) (*ledgerv1.ActionEvent, error) {
	row, err := s.q.LastEventBySession(ctx, sessionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("last event %s: %w", sessionID, ErrNotFound)
		}
		return nil, fmt.Errorf("last event: %w", err)
	}
	return eventFromRow(row), nil
}

func (s *eventStore) BySession(ctx context.Context, sessionID string) ([]*ledgerv1.ActionEvent, error) {
	rows, err := s.q.EventsBySession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("events by session: %w", err)
	}
	out := make([]*ledgerv1.ActionEvent, 0, len(rows))
	for _, row := range rows {
		out = append(out, eventFromRow(row))
	}
	return out, nil
}

func (s *eventStore) Range(ctx context.Context, fromSeq, toSeq int64) ([]*ledgerv1.ActionEvent, error) {
	rows, err := s.q.EventsInRange(ctx, storedb.EventsInRangeParams{Sequence: fromSeq, Sequence_2: toSeq})
	if err != nil {
		return nil, fmt.Errorf("events in range: %w", err)
	}
	out := make([]*ledgerv1.ActionEvent, 0, len(rows))
	for _, row := range rows {
		out = append(out, eventFromRow(row))
	}
	return out, nil
}

func eventFromRow(row storedb.Event) *ledgerv1.ActionEvent {
	return &ledgerv1.ActionEvent{
		EventId:         row.EventID,
		SessionId:       row.SessionID,
		Sequence:        row.Sequence,
		Surface:         ledgerv1.Surface(row.Surface),
		ActionType:      row.ActionType,
		ActionPayload:   row.ActionPayload,
		GrantId:         row.GrantID,
		PreStateHash:    row.PreStateHash,
		PostStateHash:   row.PostStateHash,
		RecordingRef:    row.RecordingRef,
		OccurredAt:      fromTimestamptz(row.OccurredAt),
		ContentHash:     row.ContentHash,
		PrevHash:        row.PrevHash,
		NotarySignature: row.NotarySignature,
	}
}
