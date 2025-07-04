const vscode = require('vscode');
const { openSettings } = require('./commands/openSettings');
const { generateCommitMessageCommand } = require('./commands/generateCommitMessage');
const { showCommitDiff } = require('./commands/showCommitDiff');
const { SettingsViewProvider } = require('./views/settingsViewProvider');
const { HistoryViewProvider } = require('./views/historyViewProvider');
const { COMMAND_IDS, VIEW_IDS } = require('./utils/constants');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Git Commit Local is now active');

  try {
    // Register the command to open extension settings
    const settingsCommand = vscode.commands.registerCommand(
      COMMAND_IDS.openSettings,
      openSettings
    );

    // Register the command to generate commit messages
    const generateCommand = vscode.commands.registerCommand(
      COMMAND_IDS.generateCommitMessage,
      generateCommitMessageCommand
    );

    // Register the show commit diff command
    const showDiffCommand = vscode.commands.registerCommand(
      COMMAND_IDS.showCommitDiff,
      showCommitDiff
    );

    // Register the settings view provider
    console.log('Registering settings view provider...');
    const settingsProvider = new SettingsViewProvider(context);
    const settingsViewDisposable = vscode.window.registerWebviewViewProvider(
      VIEW_IDS.settingsView,
      settingsProvider
    );
    console.log('Settings view provider registered successfully');

    // Register the history view provider
    console.log('Registering history view provider...');
    const historyProvider = new HistoryViewProvider();
    const historyViewDisposable = vscode.window.registerTreeDataProvider(
      VIEW_IDS.historyView,
      historyProvider
    );
    console.log('History view provider registered successfully');

    context.subscriptions.push(
      settingsCommand,
      generateCommand,
      showDiffCommand,
      settingsViewDisposable,
      historyViewDisposable
    );

    console.log('Git Commit Local extension activated successfully');
  } catch (error) {
    console.error('Error activating Git Commit Local extension:', error);
    vscode.window.showErrorMessage(`Failed to activate Git Commit Local: ${error.message}`);
  }
}

/**
 * This method is called when your extension is deactivated
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};