const vscode = require('vscode');
const { SettingsService } = require('../services/settingsService');

/**
 * Quick command to change the Ollama model
 */
async function quickChangeModel() {
  const settingsService = new SettingsService();

  // Get current model
  const currentSettings = settingsService.getAllSettings();

  // Show input box with current model as placeholder
  const newModel = await vscode.window.showInputBox({
    prompt: 'Enter Ollama model name',
    placeHolder: 'e.g., qwen2.5:3b, llama3:8b, codellama:7b',
    value: currentSettings.model
  });

  if (newModel && newModel.trim() !== '') {
    try {
      await settingsService.updateSetting('model', newModel.trim());
      vscode.window.showInformationMessage(
        `Model changed to: ${newModel.trim()}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to update model: ${error.message}`
      );
    }
  }
}

/**
 * Quick command to change the Ollama endpoint
 */
async function quickChangeEndpoint() {
  const settingsService = new SettingsService();

  // Get current endpoint
  const currentSettings = settingsService.getAllSettings();

  // Show input box with current endpoint as placeholder
  const newEndpoint = await vscode.window.showInputBox({
    prompt: 'Enter Ollama API endpoint URL',
    placeHolder: 'e.g., http://localhost:11434, http://192.168.1.100:11434',
    value: currentSettings.endpoint
  });

  if (newEndpoint && newEndpoint.trim() !== '') {
    try {
      await settingsService.updateSetting('endpoint', newEndpoint.trim());
      vscode.window.showInformationMessage(
        `Endpoint changed to: ${newEndpoint.trim()}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to update endpoint: ${error.message}`
      );
    }
  }
}

/**
 * Quick command to pull a new model from Ollama
 */
async function quickPullModel() {
  // Show input box for model name
  const modelName = await vscode.window.showInputBox({
    prompt: 'Enter model name to pull from Ollama',
    placeHolder: 'e.g., qwen2.5:3b, llama3:8b, codellama:7b'
  });

  if (!modelName || modelName.trim() === '') {
    return;
  }

  const settingsService = new SettingsService();
  const currentSettings = settingsService.getAllSettings();

  // Show progress while pulling model
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Pulling model: ${modelName.trim()}`,
      cancellable: false
    },
    async(progress) => {
      progress.report({ increment: 0 });

      try {
        const axios = require('axios');

        // Call Ollama pull API
        await axios.post(
          `${currentSettings.endpoint}/api/pull`,
          {
            name: modelName.trim()
          }
        );

        progress.report({ increment: 100 });

        vscode.window.showInformationMessage(
          `Successfully pulled model: ${modelName.trim()}`
        );

        // Ask if user wants to set this as the active model
        const setAsActive = await vscode.window.showQuickPick(['Yes', 'No'], {
          placeHolder: `Set ${modelName.trim()} as the active model?`
        });

        if (setAsActive === 'Yes') {
          await settingsService.updateSetting('model', modelName.trim());
          vscode.window.showInformationMessage(
            `Active model set to: ${modelName.trim()}`
          );
        }
      } catch (error) {
        console.error('Error pulling model:', error);
        vscode.window.showErrorMessage(
          `Failed to pull model: ${error.message}`
        );
      }
    }
  );
}

/**
 * Quick command to list available models
 */
async function quickListModels() {
  const settingsService = new SettingsService();
  const currentSettings = settingsService.getAllSettings();

  try {
    const axios = require('axios');

    // Get list of models from Ollama
    const response = await axios.get(`${currentSettings.endpoint}/api/tags`);
    const models = response.data.models || [];

    if (models.length === 0) {
      vscode.window.showInformationMessage(
        'No models found. Pull a model first.'
      );
      return;
    }

    // Create quick pick items
    const modelItems = models.map((model) => ({
      label: model.name,
      detail: `Size: ${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB`,
      description: model.name === currentSettings.model ? '(active)' : '',
      model: model.name
    }));

    // Show quick pick
    const selected = await vscode.window.showQuickPick(modelItems, {
      placeHolder: 'Select a model to set as active',
      matchOnDetail: true
    });

    if (selected && selected.model !== currentSettings.model) {
      await settingsService.updateSetting('model', selected.model);
      vscode.window.showInformationMessage(
        `Active model set to: ${selected.model}`
      );
    }
  } catch (error) {
    console.error('Error listing models:', error);
    vscode.window.showErrorMessage(`Failed to list models: ${error.message}`);
  }
}

/**
 * Quick command to adjust temperature
 */
async function quickSetTemperature() {
  const settingsService = new SettingsService();
  const currentSettings = settingsService.getAllSettings();

  // Show quick pick for common temperature values
  const tempOptions = [
    { label: '0.1 - Very deterministic', value: 0.1 },
    { label: '0.2 - Deterministic (default)', value: 0.2 },
    { label: '0.5 - Balanced', value: 0.5 },
    { label: '0.7 - Creative', value: 0.7 },
    { label: '1.0 - Very creative', value: 1.0 },
    { label: 'Custom value...', value: 'custom' }
  ];

  const selected = await vscode.window.showQuickPick(tempOptions, {
    placeHolder: `Current temperature: ${currentSettings.temperature}`
  });

  if (!selected) return;

  let newTemperature = selected.value;

  if (selected.value === 'custom') {
    const customTemp = await vscode.window.showInputBox({
      prompt: 'Enter temperature value (0.0 - 2.0)',
      placeHolder: '0.2',
      value: currentSettings.temperature.toString(),
      validateInput: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 2) {
          return 'Temperature must be a number between 0.0 and 2.0';
        }
        return null;
      }
    });

    if (!customTemp) return;
    newTemperature = parseFloat(customTemp);
  }

  try {
    await settingsService.updateSetting('temperature', newTemperature);
    vscode.window.showInformationMessage(
      `Temperature set to: ${newTemperature}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to update temperature: ${error.message}`
    );
  }
}

/**
 * Quick command to set max tokens with thick mode option
 */
async function quickSetMaxTokens() {
  const settingsService = new SettingsService();
  const currentSettings = settingsService.getAllSettings();

  // Show quick pick for common max token values
  const tokenOptions = [
    { label: '300 - Normal mode (default)', value: 300 },
    { label: '500 - Extended', value: 500 },
    { label: '1000 - Large', value: 1000 },
    { label: '5000 - Very large', value: 5000 },
    { label: '30000 - Thick mode (for complex diffs)', value: 30000 },
    { label: 'Custom value...', value: 'custom' }
  ];

  const selected = await vscode.window.showQuickPick(tokenOptions, {
    placeHolder: `Current max tokens: ${currentSettings.maxTokens}. Note: Thick mode (30000) is for complex diffs, normal mode (300) for regular use.`
  });

  if (!selected) return;

  let newMaxTokens = selected.value;

  if (selected.value === 'custom') {
    const customTokens = await vscode.window.showInputBox({
      prompt: 'Enter max tokens value (50 - 50000)',
      placeHolder: '300',
      value: currentSettings.maxTokens.toString(),
      validateInput: (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 50 || num > 50000) {
          return 'Max tokens must be a number between 50 and 50000';
        }
        return null;
      }
    });

    if (!customTokens) return;
    newMaxTokens = parseInt(customTokens);
  }

  try {
    await settingsService.updateSetting('maxTokens', newMaxTokens);
    const mode = newMaxTokens >= 30000 ? 'thick mode' : 'normal mode';
    vscode.window.showInformationMessage(
      `Max tokens set to: ${newMaxTokens} (${mode})`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to update max tokens: ${error.message}`
    );
  }
}

/**
 * Quick command to reset all settings to defaults
 */
async function quickResetSettings() {
  const confirm = await vscode.window.showWarningMessage(
    'Are you sure you want to reset all settings to defaults?',
    { modal: true },
    'Reset',
    'Cancel'
  );

  if (confirm === 'Reset') {
    try {
      const settingsService = new SettingsService();
      await settingsService.resetToDefaults();
      vscode.window.showInformationMessage(
        'All settings have been reset to defaults.'
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to reset settings: ${error.message}`
      );
    }
  }
}

module.exports = {
  quickChangeModel,
  quickChangeEndpoint,
  quickPullModel,
  quickListModels,
  quickSetTemperature,
  quickSetMaxTokens,
  quickResetSettings
};
