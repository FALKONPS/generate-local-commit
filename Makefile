# Makefile for Generate Local Commit VS Code Extension

# Variables
NPM := npm
NPXLINT := npx eslint
PACKAGE_CMD := npm run package
TEST_CMD := npm test
CLEAN_PATTERNS := *.vsix node_modules/.cache .vscode-test
SRC_DIR := src
DIST_DIR := out

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  lint          - Run ESLint on source files"
	@echo "  lint-fix      - Run ESLint with --fix on source files"
	@echo "  clean         - Clean build artifacts and cache files"
	@echo "  clean-all     - Clean everything including node_modules"
	@echo "  install       - Install dependencies"
	@echo "  build         - Build the extension as VSIX package"
	@echo "  test          - Run extension tests"
	@echo "  patch         - Increment patch version (x.x.X)"
	@echo "  minor         - Increment minor version (x.X.0)"
	@echo "  major         - Increment major version (X.0.0)"
	@echo "  dev           - Development workflow (clean, install, lint, build)"
	@echo "  release       - Release workflow (clean-all, install, lint, test, build)"
	@echo "  list-vsix     - List all VSIX files in the directory"

# Linting targets
.PHONY: lint
lint:
	@echo "Running ESLint on source files..."
	$(NPXLINT) $(SRC_DIR)/ --ext .js
	@echo "Linting completed"

.PHONY: lint-fix
lint-fix:
	@echo "Running ESLint with --fix on source files..."
	$(NPXLINT) $(SRC_DIR)/ --ext .js --fix
	@echo "Linting with fixes completed"

# Cleaning targets
.PHONY: clean
clean:
	@echo "Cleaning build artifacts and cache files..."
	@rm -rf $(CLEAN_PATTERNS)
	@rm -rf $(DIST_DIR)
	@echo "Clean completed"

.PHONY: clean-all
clean-all: clean
	@echo "Removing node_modules..."
	@rm -rf node_modules
	@echo "Full clean completed"

# Installation target
.PHONY: install
install:
	@echo "Installing dependencies..."
	$(NPM) install
	@echo "Dependencies installed"

# Build targets
.PHONY: build
build:
	@echo "Building VSIX package..."
	$(PACKAGE_CMD)
	@echo "VSIX package built successfully"
	@echo "Available VSIX files:"
	@ls -la *.vsix 2>/dev/null || echo "No VSIX files found"

.PHONY: test
test:
	@echo "Running tests..."
	$(TEST_CMD)
	@echo "Tests completed"

# Version management targets
.PHONY: patch
patch:
	@echo "Incrementing patch version..."
	@npm version patch --no-git-tag-version
	@echo "Patch version incremented"

.PHONY: minor
minor:
	@echo "Incrementing minor version..."
	@npm version minor --no-git-tag-version
	@echo "Minor version incremented"

.PHONY: major
major:
	@echo "Incrementing major version..."
	@npm version major --no-git-tag-version
	@echo "Major version incremented"

# Workflow targets
.PHONY: dev
dev: clean install lint build
	@echo "Development build completed"

.PHONY: release
release: clean-all install lint test build
	@echo "Release build completed"

# Utility targets
.PHONY: list-vsix
list-vsix:
	@echo "VSIX files in current directory:"
	@ls -la *.vsix 2>/dev/null || echo "No VSIX files found"

.PHONY: info
info:
	@echo "Project Information:"
	@echo "  Node version: $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "  NPM version:  $$(npm --version 2>/dev/null || echo 'Not installed')"
	@echo "  Package name: $$(grep -o '"name": "[^"]*' package.json | cut -d'"' -f4 2>/dev/null || echo 'Unknown')"
	@echo "  Package version: $$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4 2>/dev/null || echo 'Unknown')"
	@echo "  Source files: $$(find $(SRC_DIR) -name '*.js' | wc -l 2>/dev/null || echo '0') JavaScript files"

# Force rebuild (ignores cached builds)
.PHONY: rebuild
rebuild: clean build
	@echo "Force rebuild completed"

# Check if required tools are available
.PHONY: check-tools
check-tools:
	@echo "Checking required tools..."
	@command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found. Please install Node.js"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "ERROR: NPM not found. Please install NPM"; exit 1; }
	@test -f package.json || { echo "ERROR: package.json not found. Are you in the right directory?"; exit 1; }
	@echo "All required tools are available"