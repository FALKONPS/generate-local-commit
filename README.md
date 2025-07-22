# Generate Local Commit

A VSCode extension that generates commit messages using local [Ollama](https://ollama.com/) models, providing privacy and flexibility.

[![Ollama GitHub](https://img.shields.io/badge/Ollama-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/ollama/ollama)
[![VS Code Marketplace](https://img.shields.io/badge/VS_Code-Marketplace-007ACC?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=falkonps.generate-local-commit)

## Features

- Generate commit messages privately using locally-hosted Ollama models
- Fully customizable prompt templates with live editing and testing
- Configure temperature and token settings to control generation style
- Works with staged or unstaged changes
- Adjustable context range to include lines before and after changes
- **Enhanced commit message functionality** - enhance or reduce existing commit messages
- **Pull Request summary generation** - create comprehensive PR descriptions from recent commits
- **Message cleanup control** - toggle AI response cleaning on/off with visual indicators
- **Max Tokens control** - normal mode (300 tokens) for regular use, thick mode (30,000 tokens) for complex diffs
- **Quick Actions sidebar** - convenient access to all settings and actions from the activity bar
- **Prompt Templates management** - dedicated sidebar for editing, testing, and managing all prompt types

## Requirements

- [Ollama](https://ollama.com/) installed and running locally
- Default model: `qwen2.5:3b` (can be changed in settings)
- Git installed and accessible from the command line
- A Git repository initialized in your workspace

## Installation

1. Ensure Ollama is running locally
2. Pull your preferred model with Ollama (e.g., `ollama pull qwen2.5:3b`)
3. Configure the extension settings if needed

## Usage
<img width="801" height="263" alt="image" src="https://github.com/user-attachments/assets/e726fe95-20f1-422f-b128-40a46d9aace1" />

<img width="583" height="981" alt="Screenshot From 2025-07-22 18-45-36" src="https://github.com/user-attachments/assets/72316192-cb04-4a3d-8566-7de729f95176" />
<img width="586" height="678" alt="Screenshot From 2025-07-22 18-45-53" src="https://github.com/user-attachments/assets/a39198df-249a-4523-a57d-32caf475efda" />

### Basic Usage

1. Make changes to your files in a Git repository
2. Stage your changes (optional)
3. Open the Source Control view in VSCode (`Ctrl+Shift+G`)
4. Click the "Generate Commit Message using Ollama" button in the SCM title menu
5. The generated commit message will be inserted into the commit message input box

### Quick Actions Sidebar

The extension provides a convenient Quick Actions sidebar in the activity bar:

**Model Management:**
- View current active model
- Change model quickly
- List all available models
- Pull new models from Ollama registry

**Quick Settings:**
- View and change Ollama endpoint
- Adjust temperature (creativity level)
- **Set Max Tokens** - Choose between normal mode (300 tokens) or thick mode (30,000 tokens) for complex diffs
- **Message Cleanup Control** - Toggle AI response cleaning with visual status indicators
- Access full settings UI

**System Actions:**
- Generate commit messages
- **Enhance commit messages** - Make existing messages more detailed and professional
- **Reduce commit messages** - Shorten messages while preserving meaning
- **Generate PR Summary** - Create comprehensive pull request descriptions from recent commits
- Reset all settings to defaults

**Prompt Templates Sidebar:**
- Edit and customize all prompt templates (Generate, Enhance, Reduce)
- Test prompts with live preview
- Reset templates to defaults
- Preview current prompt content

### Advanced Features

#### Message Enhancement
- **Enhance**: Transform basic commit messages into detailed, professional ones following Git best practices
- **Reduce**: Shorten lengthy commit messages to meet Git's 50-character recommendation while preserving core meaning

#### Pull Request Summary Generation
- **Generate PR Summary**: Analyze recent commit messages to create comprehensive pull request descriptions
- Choose number of commits to include (5, 10, 15, 20, or custom)
- Select base branch for comparison (main, master, develop, or custom)
- AI generates structured PR summary with title, overview, grouped changes, and notes
- Output includes formatted markdown ready for GitHub/GitLab PR descriptions
- Automatically copies to clipboard for easy pasting

#### Message Cleanup Control
- **Toggle Cleanup**: Enable/disable automatic AI response cleaning with visual feedback
- **Status Indicators**: Green checkmark when enabled, red X when disabled
- **Raw Mode**: When disabled, use unprocessed AI output directly
- **Cleaned Mode**: When enabled, removes thinking tags, markdown artifacts, and normalizes formatting

## Extension Settings

This extension contributes the following settings that you can customize:

| Setting                                   | Description                                                    | Default                  |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| `generate-local-commit.endpoint`               | Ollama API endpoint URL                                        | `http://localhost:11434` |
| `generate-local-commit.model`                  | Ollama model to use                                            | `qwen2.5:3b`             |
| `generate-local-commit.maxTokens`              | Maximum tokens to generate (300 normal, 30000 thick mode)     | `300`                    |
| `generate-local-commit.temperature`            | Temperature for generation (higher is more creative)           | `0.2`                    |
| `generate-local-commit.contextRange`           | Number of context lines to include above and below each change | `3`                      |
| `generate-local-commit.promptTemplate`         | Template for the prompt with `${diff}` placeholder             | _(See below)_            |
| `generate-local-commit.useConventionalCommits` | Follow conventional commits format                             | `true`                   |
| `generate-local-commit.showDiffConfirmation`   | Show confirmation dialog with diff before generating           | `false`                  |
| `generate-local-commit.enhancePrompt`          | Template for enhancing commit messages with `${message}` placeholder | _(See settings)_         |
| `generate-local-commit.reducePrompt`           | Template for reducing commit messages with `${message}` placeholder  | _(See settings)_         |
| `generate-local-commit.prSummaryPrompt`        | Template for generating PR summaries with `${commits}` placeholder    | _(See settings)_         |
| `generate-local-commit.enableMessageCleanup`   | Enable automatic cleanup of AI responses (tags, formatting)   | `true`                   |

## Accessing Settings

You can access the extension settings in multiple ways:

- **Quick Actions Sidebar**: Click the Git Commit icon in the activity bar and use the "Open Settings UI" action
- **Source Control View**: Click the "Open Generate Local Commit Settings" button in the SCM title menu
- **VS Code Settings**: Go to File → Preferences → Settings and search for "generate-local-commit"
- **Command Palette**: Use `Ctrl+Shift+P` and type "Open Generate Local Commit Settings"

## Max Tokens Feature

The extension now supports two token modes:

- **Normal Mode (300 tokens)**: Suitable for regular commit messages and standard diffs
- **Thick Mode (30,000 tokens)**: Designed for complex diffs with extensive changes that require more detailed analysis

Use the Quick Actions sidebar to easily switch between modes based on your needs.

## Context Range Feature

The context range setting allows you to include additional lines of code above and below each change in the diff. This provides more context to the model, helping it understand the changes better and generate more accurate commit messages.

For example:

- Setting `contextRange` to `5` will include 5 lines before and 5 lines after each changed section
- Setting `contextRange` to `0` will only include the changed lines themselves

Increasing the context range can be particularly useful when:

- Working with complex code where understanding surrounding context is important
- Making small changes in large functions

## Customizing the Prompt

You can customize the prompt template in settings. The `${diff}` placeholder will be replaced with the actual git diff.

**Example prompt template:**

```
You are an AI assistant specialized in creating concise and meaningful git commit messages. When provided with a git diff, your task is to generate a clear commit message following the conventional commit format.

Your commit messages should:
1. Follow the pattern: type(optional scope): description
2. Use one of these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Focus on WHAT changed and WHY, not HOW it was implemented
4. Be under 50 characters whenever possible
5. Use imperative, present tense (e.g., "add feature" not "added feature")
6. Generate the git commit message inside [COMMIT][/COMMIT] tags based on the content of the diff provided inside [DIFF][/DIFF] tags

Types explained:
- feat: A new feature or significant enhancement
- fix: A bug fix
- docs: Documentation changes only
- style: Changes that don't affect code meaning (formatting, whitespace)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or correcting tests
- build: Changes to build system or dependencies
- ci: Changes to CI configuration/scripts
- chore: Routine maintenance tasks, dependency updates

[DIFF]${diff}[/DIFF]
```

## Development

This extension includes development tools for building and maintaining the codebase:

### Available Make Commands

```bash
# Development workflow
make dev           # Clean, install, lint, and build
make release       # Full release build with tests

# Individual commands
make lint          # Run ESLint on source files
make lint-fix      # Run ESLint with automatic fixes
make clean         # Clean build artifacts and cache
make build         # Build VSIX package
make test          # Run extension tests

# Utilities
make help          # Show all available commands
make info          # Show project information
make list-vsix     # List generated VSIX files
```

### Building from Source

1. Clone the repository
2. Run `make dev` to set up development environment
3. Make your changes
4. Run `make lint-fix` to format code
5. Run `make build` to create VSIX package

## License

This extension is licensed under the [MIT License](LICENSE).
