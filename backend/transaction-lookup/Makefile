GO_FILES=$(shell find . \( -path "./.go_pkg_cache" -o -path "./data" \) -prune -o -name "*.go" -print)

.PHONY: install_lint fmt format lint start_infra stop_infra help

install_lint:
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.64.6

#? fmt: Ensure consistent code formatting.
fmt: format

format:
	gofmt -s -w ${GO_FILES}

#? lint: Run pre-selected linters.
lint:
	golangci-lint run ./... --exclude-dirs database

start_infra:
	docker compose up -d --remove-orphans

stop_infra:
	docker compose down

#? help: Get more info on make commands.
help: Makefile
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@sed -n 's/^#?//p' $< | column -t -s ':' |  sort | sed -e 's/^/ /'
