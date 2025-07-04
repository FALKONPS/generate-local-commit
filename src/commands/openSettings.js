const vscode = require('vscode');

/**
 * Command to open extension settings
 */
function openSettings() {
  vscode.commands.executeCommand(
    'workbench.action.openSettings',
    'git-commit-local'
  );
}

module.exports = {
  openSettings,
};