.PHONY: run run-backend run-student run-admin run-app

# Run all services concurrently
run:
	@echo "Starting all services (Backend, Student Web, Admin Web, Student App)..."
	@$(MAKE) -j4 run-backend run-student run-admin run-app

run-backend:
	cd backend && make run-api

run-student:
	cd student && pnpm dev

run-admin:
	cd admin && pnpm dev

run-app:
	cd student-app && npm start
