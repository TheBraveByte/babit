# syntax=docker/dockerfile:1.7

FROM --platform=$BUILDPLATFORM golang:1.26-bookworm AS build

ARG TARGETOS
ARG TARGETARCH
ENV CGO_ENABLED=0 \
    GOOS=$TARGETOS \
    GOARCH=$TARGETARCH \
    GOFLAGS="-mod=readonly"

WORKDIR /src

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

COPY . .

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian13:nonroot

WORKDIR /app
COPY --from=build --chown=nonroot:nonroot /out/server /app/server
COPY --from=build --chown=nonroot:nonroot /src/gen/openapi/ledger.swagger.json /app/openapi/ledger.swagger.json

ENV OPENAPI_PATH=/app/openapi/ledger.swagger.json \
    GRPC_ADDR=127.0.0.1:9090 \
    NAL_GRPC=127.0.0.1:9090 \
    HTTP_ADDR=:8080

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/server"]
