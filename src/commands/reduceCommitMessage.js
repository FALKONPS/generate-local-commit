const vscode = require('vscode');
const { OllamaService } = require('../services/ollamaService');
const { SettingsService } = require('../services/settingsService');
const { DebugService } = require('../services/debugService');
const { cleanCommitMessage } = require('../utils/messageCleanup');
const { getDefaultReducePrompt } = require('../utils/promptTemplate');

/**
 * Reduce/shorten an existing commit message using Ollama
 */
async function reduceCommitMessage() {
  const ollamaService = new OllamaService();
  const settingsService = new SettingsService();
  const debugService = new DebugService();

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

    // Get settings
    const settings = settingsService.getAllSettings();
    const reducePrompt = settings.reducePrompt || getDefaultReducePrompt();

    // Replace placeholder with actual message
    const prompt = reducePrompt.replace('${message}', currentMessage);

    // Debug mode: Show preview before proceeding
    if (settings.enableDebugMode) {
      const shouldProceed = await debugService.showDebugPreview({
        prompt,
        action: 'reduce',
        settings,
        commitMessage: currentMessage
      });

      if (!shouldProceed) {
        return; // User cancelled
      }
    }

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Reducing commit message with Ollama...',
        cancellable: false
      },
      async() => {
        try {
          // Generate reduced message
          const rawReducedMessage = await ollamaService.generateCommitMessage(
            prompt,
            settings
          );

          if (rawReducedMessage) {
            // Clean up the message using messageCleanup utility
            const reducedMessage = settings.enableMessageCleanup ?
              cleanCommitMessage(rawReducedMessage) : rawReducedMessage;

            // Debug mode: Show AI response details
            if (settings.enableDebugMode) {
              await debugService.showResponseDebug(
                rawReducedMessage,
                reducedMessage,
                'reduce',
                settings.enableMessageCleanup
              );
            }

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


module.exports = {
  reduceCommitMessage
};
