GOBIN := $(shell go env GOPATH)/bin
DATABASE_URL ?= postgres://postgres:pass@localhost:55432/nal?sslmode=disable

.PHONY: generate proto sqlc build test vet lint db-up db-down migrate sqlc-gen run compose-up compose-down

generate: proto sqlc-gen

proto:
	PATH="$(PATH):$(GOBIN)" buf lint
	PATH="$(PATH):$(GOBIN)" buf generate

sqlc-gen:
	cd db && PATH="$(PATH):$(GOBIN)" sqlc generate

build:
	go build ./...

vet:
	go vet ./...

lint:
	PATH="$(PATH):$(GOBIN)" buf lint

test:
	DATABASE_URL="$(DATABASE_URL)" go test ./...

db-up:
	docker run -d --name nal_pg -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=nal -p 55432:5432 postgres:16
	@until docker exec nal_pg pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

db-down:
	docker rm -f nal_pg

migrate:
	PATH="$(PATH):$(GOBIN)" goose -dir db/migrations postgres "$(DATABASE_URL)" up

compose-up:
	docker compose up -d

compose-down:
	docker compose down

run:
	go run ./cmd/nald
