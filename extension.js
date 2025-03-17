// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const axios = require('axios');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Git Commit Local is now active');

  // Register the command to open extension settings
  let settingsCommand = vscode.commands.registerCommand(
    'git-commit-local.openSettings',
    function () {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'git-commit-local'
      );
    }
  );

  context.subscriptions.push(settingsCommand);

  // Register the command to generate commit messages
  let disposable = vscode.commands.registerCommand(
    'git-commit-local.generateCommitMessage',
    async function () {
      try {
        const config = vscode.workspace.getConfiguration('git-commit-local');
        const ollamaEndpoint =
          config.get('endpoint') || 'http://localhost:11434';
        const modelName = config.get('model') || 'qwen2.5:3b';
        const maxTokens = config.get('maxTokens') || 300;
        const temperature = config.get('temperature') || 0.2;
        const useConventionalCommits =
          config.get('useConventionalCommits') !== false;
        const showDiffConfirmation =
          config.get('showDiffConfirmation') || false;

        // Get git diff to analyze changes
        const diff = await getGitDiff();
        if (!diff) {
          vscode.window.showInformationMessage('No changes to commit.');
          return;
        }

        // Show progress notification
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating commit message...',
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            // Show diff confirmation if enabled
            if (showDiffConfirmation) {
              // Show a preview of the diff with confirmation dialog
              const diffPreview =
                diff.length > 1000 ? diff.substring(0, 1000) + '...' : diff;
              const confirmResult = await vscode.window.showInformationMessage(
                'Generate commit message for these changes?',
                { modal: true, detail: diffPreview },
                'Generate',
                'Cancel'
              );

              if (confirmResult !== 'Generate') {
                return; // User cancelled
              }
            }

            // Get prompt template from settings and replace diff placeholder
            let promptTemplate = config.get('promptTemplate');
            if (!promptTemplate) {
              promptTemplate = `
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
			`;
            }

            // Replace the diff placeholder with the actual diff
            let prompt = promptTemplate.replace('${diff}', diff);

            // Call Ollama API
            const response = await axios.post(
              `${ollamaEndpoint}/api/generate`,
              {
                model: modelName,
                prompt: prompt,
                stream: false,
                options: {
                  temperature: temperature,
                  num_predict: maxTokens,
                },
              }
            );

            progress.report({ increment: 100 });

            const rawMessage = response.data.response.trim();

            // Extract the commit message from between [COMMIT][/COMMIT] tags
            let message = rawMessage;
            const commitTagRegex = /\[COMMIT\]([\s\S]*?)\[\/COMMIT\]/;
            const match = rawMessage.match(commitTagRegex);

            if (match && match[1]) {
              message = match[1].trim();
            }

            // Check if the message is empty after processing
            if (!message) {
              vscode.window.showWarningMessage(
                'Empty commit message returned. Please try again or write a manual message.'
              );
              return;
            }

            // Get SCM input box and set the commit message
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
              const gitExtensionExports = gitExtension.exports;
              const api = gitExtensionExports.getAPI(1);

              if (api && api.repositories && api.repositories.length > 0) {
                // Set the commit message in the active repository
                const repo = api.repositories[0];
                repo.inputBox.value = message;
                vscode.window.showInformationMessage(
                  'Commit message added to Git input!'
                );
              } else {
                // Fallback to SCM input box
                const scmInputBox = vscode.scm.inputBox;
                if (scmInputBox) {
                  scmInputBox.value = message;
                  vscode.window.showInformationMessage(
                    'Commit message generated!'
                  );
                } else {
                  // Last resort - copy to clipboard
                  await vscode.env.clipboard.writeText(message);
                  vscode.window.showInformationMessage(
                    'Commit message copied to clipboard'
                  );
                }
              }
            } else {
              // Fallback - copy to clipboard
              await vscode.env.clipboard.writeText(message);
              vscode.window.showInformationMessage(
                'Git extension not found. Message copied to clipboard.'
              );
            }
          }
        );
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          `Error generating commit message: ${error.message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * Get the git diff of staged changes
 */
async function getGitDiff() {
  try {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // First check if there are staged changes
    const { stdout: stagedChanges } = await exec(
      'git diff --staged --name-only',
      { cwd: rootPath }
    );

    if (!stagedChanges.trim()) {
      // If no staged changes, check if there are unstaged changes
      const { stdout: unstagedChanges } = await exec('git diff --name-only', {
        cwd: rootPath,
      });

      if (!unstagedChanges.trim()) {
        return null; // No changes at all
      }

      // Get diff of unstaged changes
      const { stdout: diff } = await exec('git diff', { cwd: rootPath });
      return diff;
    }

    // Get diff of staged changes
    const { stdout: diff } = await exec('git diff --staged', { cwd: rootPath });
    return diff;
  } catch (error) {
    console.error('Git diff error:', error);
    throw new Error(
      'Failed to get git diff. Make sure you are in a git repository.'
    );
  }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
