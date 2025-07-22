const vscode = require('vscode');

/**
 * Command to open extension settings
 */
function openSettings() {
  vscode.commands.executeCommand(
    'workbench.action.openSettings',
    'generate-local-commit'
  );
}

module.exports = {
  openSettings
};
