const vscode = require('vscode');
const { getGitDiff } = require('../services/gitService');
const { generateCommitMessage } = require('../services/ollamaService');
const { getDefaultPromptTemplate } = require('../utils/promptTemplate');
const { DEFAULT_CONFIG, CONFIG_SECTION } = require('../utils/constants');

/**
 * Command to generate commit message using Ollama
 */
async function generateCommitMessageCommand() {
  try {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const ollamaEndpoint = config.get('endpoint') || DEFAULT_CONFIG.endpoint;
    const modelName = config.get('model') || DEFAULT_CONFIG.model;
    const maxTokens = config.get('maxTokens') || DEFAULT_CONFIG.maxTokens;
    const temperature = config.get('temperature') || DEFAULT_CONFIG.temperature;
    const useConventionalCommits = config.get('useConventionalCommits') !== false;
    const showDiffConfirmation = config.get('showDiffConfirmation') || DEFAULT_CONFIG.showDiffConfirmation;
    const contextRange = config.get('contextRange') || DEFAULT_CONFIG.contextRange;

    // Get git diff to analyze changes with context
    const diff = await getGitDiff(contextRange);
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

        // Get prompt template from settings and check if it contains the diff placeholder
        let promptTemplate = config.get('promptTemplate');
        if (!promptTemplate) {
          promptTemplate = getDefaultPromptTemplate();
        }

        // Validate that the template contains the ${diff} placeholder
        if (!promptTemplate.includes('${diff}')) {
          vscode.window.showErrorMessage(
            'Error: Prompt template must contain the ${diff} placeholder. Please update your settings.'
          );

          // Show settings with focus on the promptTemplate setting
          vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'git-commit-local.promptTemplate'
          );
          return;
        }

        // Replace the diff placeholder with the actual diff
        const prompt = promptTemplate.replace('${diff}', diff);

        // Generate commit message using Ollama service
        const message = await generateCommitMessage(prompt, {
          endpoint: ollamaEndpoint,
          model: modelName,
          maxTokens,
          temperature,
        });

        progress.report({ increment: 100 });

        // Check if the message is empty after processing
        if (!message) {
          vscode.window.showWarningMessage(
            'Empty commit message returned. Please try again or write a manual message.'
          );
          return;
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
  generateCommitMessageCommand,
};
