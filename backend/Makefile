# Include environment variables from .env file so Makefile can use SUPABASE_DB_URL
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: run-api run-worker sqlc migrate-up migrate-down migrate-create

# ==============================================================================
# Main Application Commands

# Run the API server
run-api:
	go run cmd/api/main.go

# Run the RabbitMQ worker
run-worker:
	go run cmd/worker/main.go

# Run a local Redis instance via Docker (optional)
run-redis:
	docker run -p 6379:6379 --name wementor-redis -d redis:7 || true

# ==============================================================================
# Database & SQLC Commands

# Generate Go code from SQL queries using sqlc
sqlc:
	sqlc generate

# ==============================================================================
# Migration Commands (Requires golang-migrate CLI)
# Install via: go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run all UP migrations
migrate-up:
	migrate -path internal/database/migrations -database "$(SUPABASE_DB_URL)" up

# Run DOWN migrations (rollback)
migrate-down:
	migrate -path internal/database/migrations -database "$(SUPABASE_DB_URL)" down

# Create a new migration file
# Usage: make migrate-create name=add_users_table
migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Error: please provide a name for the migration."; \
		echo "Usage: make migrate-create name=<migration_name>"; \
		exit 1; \
	fi
	migrate create -ext sql -dir internal/database/migrations -seq $(name)