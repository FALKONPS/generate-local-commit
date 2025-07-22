const vscode = require('vscode');
const { getGitDiff } = require('../services/gitService');
const { generateCommitMessage } = require('../services/ollamaService');
const { SettingsService } = require('../services/settingsService');
const { DebugService } = require('../services/debugService');

/**
 * Command to generate commit message using Ollama
 */
async function generateCommitMessageCommand() {
  try {
    const settingsService = new SettingsService();
    const settings = settingsService.getAllSettings();
    const debugService = new DebugService();

    // Get git diff to analyze changes with context
    const diff = await getGitDiff(settings.contextRange);
    if (!diff) {
      vscode.window.showInformationMessage('No changes to commit.');
      return;
    }

    // Validate that the template contains the ${diff} placeholder
    if (!settings.promptTemplate.includes('${diff}')) {
      vscode.window.showErrorMessage(
        'Error: Prompt template must contain the ${diff} placeholder. Please update your settings.'
      );
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'generate-local-commit.promptTemplate'
      );
      return;
    }

    // Replace the diff placeholder with the actual diff
    const prompt = settings.promptTemplate.replace('${diff}', diff);

    // Debug mode: Show preview before proceeding
    if (settings.enableDebugMode) {
      const shouldProceed = await debugService.showDebugPreview({
        diff,
        prompt,
        action: 'generate',
        settings
      });

      if (!shouldProceed) {
        return; // User cancelled
      }
    }

    // Show progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false
      },
      async(progress) => {
        progress.report({ increment: 50 });

        // Generate commit message using Ollama service
        const message = await generateCommitMessage(prompt, settings);

        progress.report({ increment: 100 });

        // Check if the message is empty after processing
        if (!message) {
          vscode.window.showWarningMessage(
            'Empty commit message returned. Please try again or write a manual message.'
          );
          return;
        }

        // Debug mode: Show AI response details
        if (settings.enableDebugMode) {
          // Note: We can't easily get the raw response here since it's processed in OllamaService
          // But we can still show the final result
          await debugService.showResponseDebug(
            message, // We'll show the final message as both raw and cleaned
            message,
            'generate',
            settings.enableMessageCleanup
          );
        }

        // Set the commit message in the Git input box
        await setCommitMessage(message);
      }
    );
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage(
      `Error generating commit message: ${error.message}`
    );
  }
}

/**
 * Set the commit message in the Git input box
 * @param {string} message - The commit message to set
 */
async function setCommitMessage(message) {
  try {
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
          vscode.window.showInformationMessage('Commit message generated!');
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
  } catch (error) {
    console.error('Error setting commit message:', error);
    // Last resort - copy to clipboard
    await vscode.env.clipboard.writeText(message);
    vscode.window.showInformationMessage(
      'Error setting commit message. Message copied to clipboard.'
    );
  }
}

module.exports = {
  generateCommitMessageCommand
};
