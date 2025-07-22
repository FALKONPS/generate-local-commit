const vscode = require('vscode');
const { OllamaService } = require('../services/ollamaService');
const { SettingsService } = require('../services/settingsService');
const { DebugService } = require('../services/debugService');
const { cleanCommitMessage } = require('../utils/messageCleanup');
const { getDefaultEnhancePrompt } = require('../utils/promptTemplate');

/**
 * Enhance an existing commit message using Ollama
 */
async function enhanceCommitMessage() {
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
      vscode.window.showErrorMessage('No commit message found to enhance');
      return;
    }

    // Get settings
    const settings = settingsService.getAllSettings();
    const enhancePrompt = settings.enhancePrompt || getDefaultEnhancePrompt();

    // Replace placeholder with actual message
    const prompt = enhancePrompt.replace('${message}', currentMessage);

    // Debug mode: Show preview before proceeding
    if (settings.enableDebugMode) {
      const shouldProceed = await debugService.showDebugPreview({
        prompt,
        action: 'enhance',
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
        title: 'Enhancing commit message with Ollama...',
        cancellable: false
      },
      async() => {
        try {
          // Generate enhanced message
          const rawEnhancedMessage = await ollamaService.generateCommitMessage(
            prompt,
            settings
          );

          if (rawEnhancedMessage) {
            // Clean up the message using messageCleanup utility
            const enhancedMessage = settings.enableMessageCleanup ?
              cleanCommitMessage(rawEnhancedMessage) : rawEnhancedMessage;

            // Debug mode: Show AI response details
            if (settings.enableDebugMode) {
              await debugService.showResponseDebug(
                rawEnhancedMessage,
                enhancedMessage,
                'enhance',
                settings.enableMessageCleanup
              );
            }

            if (enhancedMessage) {
              // Update the commit message in the git interface
              repository.inputBox.value = enhancedMessage;
              vscode.window.showInformationMessage(
                'Commit message enhanced successfully!'
              );
            } else {
              vscode.window.showErrorMessage(
                'Failed to enhance commit message - cleaned message was empty'
              );
            }
          } else {
            vscode.window.showErrorMessage('Failed to enhance commit message');
          }
        } catch (error) {
          console.error('Error enhancing commit message:', error);
          vscode.window.showErrorMessage(
            `Failed to enhance commit message: ${error.message}`
          );
        }
      }
    );
  } catch (error) {
    console.error('Error in enhanceCommitMessage:', error);
    vscode.window.showErrorMessage(
      `Error enhancing commit message: ${error.message}`
    );
  }
}


module.exports = {
  enhanceCommitMessage
};
