const vscode = require('vscode');
const { openSettings } = require('./commands/openSettings');
const {
  generateCommitMessageCommand
} = require('./commands/generateCommitMessage');
const { showCommitDiff } = require('./commands/showCommitDiff');
const { enhanceCommitMessage } = require('./commands/enhanceCommitMessage');
const { reduceCommitMessage } = require('./commands/reduceCommitMessage');
const {
  quickChangeModel,
  quickChangeEndpoint,
  quickPullModel,
  quickListModels,
  quickSetTemperature,
  quickSetMaxTokens,
  quickResetSettings
} = require('./commands/quickConfig');
const {
  editPrompt,
  resetPrompt,
  testPrompt
} = require('./commands/promptManagement');
const { toggleMessageCleanup, setQuickActionsProvider } = require('./commands/toggleMessageCleanup');
const { QuickActionsProvider } = require('./views/quickActionsProvider');
const { PromptManagementProvider } = require('./views/promptManagementProvider');
const { HistoryViewProvider } = require('./views/historyViewProvider');
const { COMMAND_IDS, VIEW_IDS } = require('./utils/constants');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Generate Local Commit is now active');

  try {
    // Register commands
    const settingsCommand = vscode.commands.registerCommand(
      COMMAND_IDS.openSettings,
      openSettings
    );

    const generateCommand = vscode.commands.registerCommand(
      COMMAND_IDS.generateCommitMessage,
      generateCommitMessageCommand
    );

    const showDiffCommand = vscode.commands.registerCommand(
      COMMAND_IDS.showCommitDiff,
      showCommitDiff
    );

    // Register quick config commands
    const quickChangeModelCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickChangeModel,
      quickChangeModel
    );

    const quickChangeEndpointCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickChangeEndpoint,
      quickChangeEndpoint
    );

    const quickPullModelCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickPullModel,
      quickPullModel
    );

    const quickListModelsCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickListModels,
      quickListModels
    );

    const quickSetTemperatureCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickSetTemperature,
      quickSetTemperature
    );

    const quickSetMaxTokensCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickSetMaxTokens,
      quickSetMaxTokens
    );

    const quickResetSettingsCommand = vscode.commands.registerCommand(
      COMMAND_IDS.quickResetSettings,
      quickResetSettings
    );

    // Register new message enhancement commands
    const enhanceCommitMessageCommand = vscode.commands.registerCommand(
      COMMAND_IDS.enhanceCommitMessage,
      enhanceCommitMessage
    );

    const reduceCommitMessageCommand = vscode.commands.registerCommand(
      COMMAND_IDS.reduceCommitMessage,
      reduceCommitMessage
    );

    // Register prompt management commands
    const editPromptCommand = vscode.commands.registerCommand(
      COMMAND_IDS.editPrompt,
      editPrompt
    );

    const resetPromptCommand = vscode.commands.registerCommand(
      COMMAND_IDS.resetPrompt,
      resetPrompt
    );

    const testPromptCommand = vscode.commands.registerCommand(
      COMMAND_IDS.testPrompt,
      testPrompt
    );

    const toggleMessageCleanupCommand = vscode.commands.registerCommand(
      COMMAND_IDS.toggleMessageCleanup,
      toggleMessageCleanup
    );

    // Register view providers immediately
    console.log('Registering view providers...');

    const quickActionsProvider = new QuickActionsProvider();
    const quickActionsViewDisposable = vscode.window.registerTreeDataProvider(
      VIEW_IDS.quickActionsView,
      quickActionsProvider
    );

    // Set the provider instance for the toggle command to refresh the view
    setQuickActionsProvider(quickActionsProvider);

    console.log(
      'Quick actions view provider registered for:',
      VIEW_IDS.quickActionsView
    );

    const promptManagementProvider = new PromptManagementProvider();
    const promptManagementViewDisposable = vscode.window.registerTreeDataProvider(
      VIEW_IDS.promptManagementView,
      promptManagementProvider
    );
    console.log(
      'Prompt management view provider registered for:',
      VIEW_IDS.promptManagementView
    );

    const historyProvider = new HistoryViewProvider();
    const historyViewDisposable = vscode.window.registerTreeDataProvider(
      VIEW_IDS.historyView,
      historyProvider
    );
    console.log('History view provider registered for:', VIEW_IDS.historyView);

    // Add to subscriptions
    context.subscriptions.push(
      settingsCommand,
      generateCommand,
      showDiffCommand,
      quickChangeModelCommand,
      quickChangeEndpointCommand,
      quickPullModelCommand,
      quickListModelsCommand,
      quickSetTemperatureCommand,
      quickSetMaxTokensCommand,
      quickResetSettingsCommand,
      enhanceCommitMessageCommand,
      reduceCommitMessageCommand,
      editPromptCommand,
      resetPromptCommand,
      testPromptCommand,
      toggleMessageCleanupCommand,
      quickActionsViewDisposable,
      promptManagementViewDisposable,
      historyViewDisposable
    );

    console.log('Generate Local Commit extension activated successfully');
    console.log('View IDs registered:', VIEW_IDS);

    // Show a success message
    vscode.window.showInformationMessage(
      'Generate Local Commit extension is now active! Check the Activity Bar for the Git Commit icon.'
    );
  } catch (error) {
    console.error('Error activating Generate Local Commit extension:', error);
    vscode.window.showErrorMessage(
      `Failed to activate Generate Local Commit: ${error.message}`
    );
  }
}

/**
 * This method is called when your extension is deactivated
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
