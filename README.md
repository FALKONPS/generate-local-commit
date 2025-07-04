# Generate Local Commit

A VSCode extension that generates commit messages using local [Ollama](https://ollama.com/) models, providing privacy and flexibility.

[![Ollama GitHub](https://img.shields.io/badge/Ollama-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/ollama/ollama)
[![VS Code Marketplace](https://img.shields.io/badge/VS_Code-Marketplace-007ACC?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=falkonps.generate-local-commit)

## Features

- Generate commit messages privately using locally-hosted Ollama models
- Fully customizable prompt templates
- Configure temperature and token settings to control generation style
- Works with staged or unstaged changes
- Adjustable context range to include lines before and after changes

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

![image](https://github.com/user-attachments/assets/e5413925-7c73-4eb4-95df-1e6019222136)
![image](https://github.com/user-attachments/assets/900112fa-f868-4d27-8a73-3fdaa9e390bf)

1. Make changes to your files in a Git repository
2. Stage your changes (optional)
3. Open the Source Control view in VSCode (`Ctrl+Shift+G`)
4. Click the "Generate Commit Message using Ollama" button in the SCM title menu
5. The generated commit message will be inserted into the commit message input box

## Extension Settings

This extension contributes the following settings that you can customize:

| Setting                                   | Description                                                    | Default                  |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| `git-commit-local.endpoint`               | Ollama API endpoint URL                                        | `http://localhost:11434` |
| `git-commit-local.model`                  | Ollama model to use                                            | `qwen2.5:3b`             |
| `git-commit-local.maxTokens`              | Maximum tokens to generate                                     | `300`                    |
| `git-commit-local.temperature`            | Temperature for generation (higher is more creative)           | `0.2`                    |
| `git-commit-local.contextRange`           | Number of context lines to include above and below each change | `3`                      |
| `git-commit-local.promptTemplate`         | Template for the prompt with `${diff}` placeholder             | _(See below)_            |
| `git-commit-local.useConventionalCommits` | Follow conventional commits format                             | `true`                   |
| `git-commit-local.showDiffConfirmation`   | Show confirmation dialog with diff before generating           | `false`                  |

## Accessing Settings

You can access the extension settings in three ways:

- Click the "Open Generate Local Commit Settings" button in the Source Control view
- Go to File → Preferences → Settings and search for "git-commit-local"
- Use the command palette (`Ctrl+Shift+P`) and type "Open Generate Local Commit Settings"

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

## License

This extension is licensed under the [MIT License](LICENSE).
