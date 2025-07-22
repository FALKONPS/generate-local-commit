const vscode = require('vscode');
const { SettingsService } = require('../services/settingsService');

// Global reference to the quick actions provider for refreshing
let quickActionsProviderInstance = null;

/**
 * Set the quick actions provider instance for refreshing
 * @param {QuickActionsProvider} provider
 */
function setQuickActionsProviderForDebug(provider) {
  quickActionsProviderInstance = provider;
}

/**
 * Toggle the debug mode functionality
 */
async function toggleDebugMode() {
  try {
    const settingsService = new SettingsService();
    const currentSettings = settingsService.getAllSettings();
    const currentState = currentSettings.enableDebugMode;

    // Toggle the setting
    const newState = !currentState;
    await settingsService.updateSetting('enableDebugMode', newState);

    // Refresh the tree view to show updated icons
    if (quickActionsProviderInstance) {
      quickActionsProviderInstance.refresh();
    }

    // Show confirmation message
    const statusText = newState ? 'enabled' : 'disabled';
    vscode.window.showInformationMessage(
      `Debug mode is now ${statusText}. ${newState ?
        'Markdown previews will show before AI requests.' :
        'Direct AI requests without preview dialogs.'}`
    );

    console.log(`Debug mode toggled: ${currentState} -> ${newState}`);
  } catch (error) {
    console.error('Error toggling debug mode:', error);
    vscode.window.showErrorMessage(`Failed to toggle debug mode: ${error.message}`);
  }
}

module.exports = {
  toggleDebugMode,
  setQuickActionsProviderForDebug
};
