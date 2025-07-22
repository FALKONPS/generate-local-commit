const vscode = require('vscode');
const { SettingsService } = require('../services/settingsService');

// Global reference to the quick actions provider for refreshing
let quickActionsProviderInstance = null;

/**
 * Set the quick actions provider instance for refreshing
 * @param {QuickActionsProvider} provider
 */
function setQuickActionsProvider(provider) {
  quickActionsProviderInstance = provider;
}

/**
 * Toggle the message cleanup functionality
 */
async function toggleMessageCleanup() {
  try {
    const settingsService = new SettingsService();
    const currentSettings = settingsService.getAllSettings();
    const currentState = currentSettings.enableMessageCleanup;

    // Toggle the setting
    const newState = !currentState;
    await settingsService.updateSetting('enableMessageCleanup', newState);

    // Refresh the tree view to show updated icons
    if (quickActionsProviderInstance) {
      quickActionsProviderInstance.refresh();
    }

    // Show confirmation message
    const statusText = newState ? 'enabled' : 'disabled';
    vscode.window.showInformationMessage(
      `Message cleanup is now ${statusText}. ${newState ?
        'AI responses will be cleaned and formatted.' :
        'Raw AI responses will be used as-is.'}`
    );

    console.log(`Message cleanup toggled: ${currentState} -> ${newState}`);
  } catch (error) {
    console.error('Error toggling message cleanup:', error);
    vscode.window.showErrorMessage(`Failed to toggle message cleanup: ${error.message}`);
  }
}

module.exports = {
  toggleMessageCleanup,
  setQuickActionsProvider
};
