const vscode = require('vscode');
const { OllamaService } = require('../services/ollamaService');
const { SettingsService } = require('../services/settingsService');
const { cleanCommitMessage } = require('../utils/messageCleanup');

/**
 * Reduce/shorten an existing commit message using Ollama
 */
async function reduceCommitMessage() {
  const ollamaService = new OllamaService();
  const settingsService = new SettingsService();

  try {
    // Get the current commit message from the git interface
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      vscode.window.showErrorMessage('Git extension not found');
      return;
    }

    const git = gitExtension.exports.getAPI(1);
    const repository = git.repositories[0];

    if (!repository) {
      vscode.window.showErrorMessage('No git repository found');
      return;
    }

    // Get current commit message from the input box
    const currentMessage = repository.inputBox.value;

    if (!currentMessage || currentMessage.trim() === '') {
      vscode.window.showErrorMessage('No commit message found to reduce');
      return;
    }

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Reducing commit message with Ollama...',
        cancellable: false,
      },
      async () => {
        try {
          // Get settings
          const settings = settingsService.getAllSettings();
          const reducePrompt =
            settings.reducePrompt || getDefaultReducePrompt();

          // Replace placeholder with actual message
          const prompt = reducePrompt.replace('${message}', currentMessage);

          // Generate reduced message
          const rawReducedMessage = await ollamaService.generateCommitMessage(
            prompt,
            settings
          );

          if (rawReducedMessage) {
            // Clean up the message using messageCleanup utility
            const reducedMessage = cleanCommitMessage(rawReducedMessage);

            if (reducedMessage) {
              // Update the commit message in the git interface
              repository.inputBox.value = reducedMessage;
              vscode.window.showInformationMessage(
                'Commit message reduced successfully!'
              );
            } else {
              vscode.window.showErrorMessage(
                'Failed to reduce commit message - cleaned message was empty'
              );
            }
          } else {
            vscode.window.showErrorMessage('Failed to reduce commit message');
          }
        } catch (error) {
          console.error('Error reducing commit message:', error);
          vscode.window.showErrorMessage(
            `Failed to reduce commit message: ${error.message}`
          );
        }
      }
    );
  } catch (error) {
    console.error('Error in reduceCommitMessage:', error);
    vscode.window.showErrorMessage(
      `Error reducing commit message: ${error.message}`
    );
  }
}

/**
 * Get default reduce prompt template
 */
function getDefaultReducePrompt() {
  return `You are an AI assistant specialized in creating concise git commit messages. Your task is to shorten the provided commit message while preserving its core meaning and important details.

Guidelines for reduction:
1. Keep the essential meaning and intent
2. Remove unnecessary words and redundant information
3. Maintain conventional commit format if present
4. Ensure it's under 50 characters if possible
5. Preserve important technical details
6. Use imperative mood (e.g., "add", "fix", "update")
7. Focus on what changed, not how it was implemented

Current commit message: \${message}

Please provide a shorter, more concise version of this commit message:`;
}

module.exports = {
  reduceCommitMessage,
};
