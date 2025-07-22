const vscode = require('vscode');
const { SettingsService } = require('../services/settingsService');
const { getDefaultPromptTemplate, getDefaultEnhancePrompt, getDefaultReducePrompt } = require('../utils/promptTemplate');
const { getGitDiff } = require('../services/gitService');
const { generateCommitMessage } = require('../services/ollamaService');

/**
 * Edit a prompt template
 * @param {string} promptType - Type of prompt (promptTemplate, enhancePrompt, reducePrompt)
 * @param {string} actionLabel - Label for the action (Generate, Enhance, Reduce)
 */
async function editPrompt(promptType, actionLabel) {
  const settingsService = new SettingsService();
  const currentSettings = settingsService.getAllSettings();
  const currentPrompt = currentSettings[promptType];

  try {
    // Open input box with current prompt
    const newPrompt = await vscode.window.showInputBox({
      title: `Edit ${actionLabel} Prompt Template`,
      value: currentPrompt,
      placeHolder: getPlaceholderText(promptType),
      prompt: `Customize the ${actionLabel.toLowerCase()} prompt template. ${getPromptRequirements(promptType)}`,
      ignoreFocusOut: true,
      valueSelection: [0, currentPrompt.length]
    });

    if (newPrompt !== undefined) {
      // Validate the prompt
      const validation = validatePrompt(newPrompt, promptType);
      if (!validation.isValid) {
        vscode.window.showErrorMessage(`Invalid prompt: ${validation.error}`);
        return;
      }

      // Save the prompt
      await settingsService.updateSetting(promptType, newPrompt);
      vscode.window.showInformationMessage(`${actionLabel} prompt updated successfully!`);
    }
  } catch (error) {
    console.error('Error editing prompt:', error);
    vscode.window.showErrorMessage(`Failed to edit prompt: ${error.message}`);
  }
}

/**
 * Reset a prompt to default
 * @param {string} promptType - Type of prompt to reset
 * @param {string} actionLabel - Label for the action
 */
async function resetPrompt(promptType, actionLabel) {
  try {
    const confirmed = await vscode.window.showWarningMessage(
      `Are you sure you want to reset the ${actionLabel.toLowerCase()} prompt to default?`,
      { modal: true },
      'Reset'
    );

    if (confirmed === 'Reset') {
      const settingsService = new SettingsService();
      let defaultPrompt;

      switch (promptType) {
        case 'promptTemplate':
          defaultPrompt = getDefaultPromptTemplate();
          break;
        case 'enhancePrompt':
          defaultPrompt = getDefaultEnhancePrompt();
          break;
        case 'reducePrompt':
          defaultPrompt = getDefaultReducePrompt();
          break;
        default:
          throw new Error('Unknown prompt type');
      }

      await settingsService.updateSetting(promptType, defaultPrompt);
      vscode.window.showInformationMessage(`${actionLabel} prompt reset to default!`);
    }
  } catch (error) {
    console.error('Error resetting prompt:', error);
    vscode.window.showErrorMessage(`Failed to reset prompt: ${error.message}`);
  }
}

/**
 * Test a prompt with current git changes
 * @param {string} promptType - Type of prompt to test
 * @param {string} actionLabel - Label for the action
 */
async function testPrompt(promptType, actionLabel) {
  try {
    const settingsService = new SettingsService();
    const currentSettings = settingsService.getAllSettings();

    if (promptType === 'promptTemplate') {
      // Test with git diff
      const diff = await getGitDiff(currentSettings.contextRange);
      if (!diff) {
        vscode.window.showWarningMessage('No git changes found to test the prompt with.');
        return;
      }

      const prompt = currentSettings.promptTemplate.replace('${diff}', diff);
      
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Testing prompt...',
        cancellable: false
      }, async () => {
        try {
          const result = await generateCommitMessage(prompt, currentSettings);
          
          // Show result in new document
          const doc = await vscode.workspace.openTextDocument({
            content: `Test Result for ${actionLabel} Prompt:\n\n${result}\n\n---\nPrompt used:\n${prompt}`,
            language: 'markdown'
          });
          await vscode.window.showTextDocument(doc);
        } catch (error) {
          vscode.window.showErrorMessage(`Test failed: ${error.message}`);
        }
      });

    } else {
      // Test with sample commit message
      const sampleMessage = await vscode.window.showInputBox({
        title: `Test ${actionLabel} Prompt`,
        prompt: 'Enter a sample commit message to test the prompt with:',
        value: 'fix: resolve authentication bug',
        placeHolder: 'Enter a commit message...'
      });

      if (!sampleMessage) return;

      const promptTemplate = promptType === 'enhancePrompt' ? 
        currentSettings.enhancePrompt : currentSettings.reducePrompt;
      const prompt = promptTemplate.replace('${message}', sampleMessage);

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Testing prompt...',
        cancellable: false
      }, async () => {
        try {
          const result = await generateCommitMessage(prompt, currentSettings);
          
          // Show result in new document
          const doc = await vscode.workspace.openTextDocument({
            content: `Test Result for ${actionLabel} Prompt:\n\nOriginal: ${sampleMessage}\nResult: ${result}\n\n---\nPrompt used:\n${prompt}`,
            language: 'markdown'
          });
          await vscode.window.showTextDocument(doc);
        } catch (error) {
          vscode.window.showErrorMessage(`Test failed: ${error.message}`);
        }
      });
    }
  } catch (error) {
    console.error('Error testing prompt:', error);
    vscode.window.showErrorMessage(`Failed to test prompt: ${error.message}`);
  }
}

/**
 * Get placeholder text for prompt type
 * @param {string} promptType 
 * @returns {string}
 */
function getPlaceholderText(promptType) {
  switch (promptType) {
    case 'promptTemplate':
      return 'Enter prompt template with ${diff} placeholder...';
    case 'enhancePrompt':
      return 'Enter prompt template with ${message} placeholder...';
    case 'reducePrompt':
      return 'Enter prompt template with ${message} placeholder...';
    default:
      return 'Enter prompt template...';
  }
}

/**
 * Get prompt requirements text
 * @param {string} promptType 
 * @returns {string}
 */
function getPromptRequirements(promptType) {
  switch (promptType) {
    case 'promptTemplate':
      return 'Must contain ${diff} placeholder.';
    case 'enhancePrompt':
    case 'reducePrompt':
      return 'Must contain ${message} placeholder.';
    default:
      return '';
  }
}

/**
 * Validate a prompt template
 * @param {string} prompt 
 * @param {string} promptType 
 * @returns {{isValid: boolean, error?: string}}
 */
function validatePrompt(prompt, promptType) {
  if (!prompt || prompt.trim() === '') {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }

  switch (promptType) {
    case 'promptTemplate':
      if (!prompt.includes('${diff}')) {
        return { isValid: false, error: 'Prompt must contain ${diff} placeholder' };
      }
      break;
    case 'enhancePrompt':
    case 'reducePrompt':
      if (!prompt.includes('${message}')) {
        return { isValid: false, error: 'Prompt must contain ${message} placeholder' };
      }
      break;
  }

  return { isValid: true };
}

module.exports = {
  editPrompt,
  resetPrompt,
  testPrompt,
};