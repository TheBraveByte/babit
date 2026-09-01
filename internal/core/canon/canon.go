package canon

import (
	"bytes"
	"encoding/binary"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func Event(ev *ledgerv1.ActionEvent) []byte {
	var b bytes.Buffer
	writeBytes(&b, []byte(ev.GetEventId()))
	writeBytes(&b, []byte(ev.GetSessionId()))
	writeInt64(&b, ev.GetSequence())
	writeInt32(&b, int32(ev.GetSurface()))
	writeBytes(&b, []byte(ev.GetActionType()))
	writeBytes(&b, ev.GetActionPayload())
	writeBytes(&b, []byte(ev.GetGrantId()))
	writeBytes(&b, ev.GetPreStateHash())
	writeBytes(&b, ev.GetPostStateHash())
	writeBytes(&b, []byte(ev.GetRecordingRef()))
	writeInt64(&b, unixNanos(ev.GetOccurredAt()))
	return b.Bytes()
}

func Grant(g *ledgerv1.Grant) []byte {
	var b bytes.Buffer
	writeBytes(&b, []byte(g.GetGrantId()))
	writeBytes(&b, []byte(g.GetParentGrantId()))
	writeBytes(&b, []byte(g.GetPrincipalId()))
	writeBytes(&b, []byte(g.GetSubjectId()))
	for _, c := range g.GetCapabilities() {
		writeBytes(&b, []byte(c))
	}
	for _, r := range g.GetScope().GetResourceGlobs() {
		writeBytes(&b, []byte(r))
	}
	writeInt64(&b, g.GetScope().GetMaxValueCents())
	writeInt32(&b, g.GetScope().GetMaxDepth())
	writeInt64(&b, unixNanos(g.GetExpiresAt()))
	return b.Bytes()
}

func writeBytes(b *bytes.Buffer, p []byte) {
	var l [4]byte
	binary.BigEndian.PutUint32(l[:], uint32(len(p)))
	b.Write(l[:])
	b.Write(p)
}

func writeInt64(b *bytes.Buffer, v int64) {
	var p [8]byte
	binary.BigEndian.PutUint64(p[:], uint64(v))
	b.Write(p[:])
}

func writeInt32(b *bytes.Buffer, v int32) {
	var p [4]byte
	binary.BigEndian.PutUint32(p[:], uint32(v))
	b.Write(p[:])
}

func unixNanos(ts *timestamppb.Timestamp) int64 {
	if ts == nil {
		return 0
	}
	return ts.AsTime().UnixNano()
}
