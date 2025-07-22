const vscode = require('vscode');
const { COMMAND_IDS } = require('../utils/constants');
const { SettingsService } = require('../services/settingsService');

/**
 * Tree data provider for quick actions in the sidebar
 */
class QuickActionsProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.settingsService = new SettingsService();
  }

  /**
   * Refresh the tree view
   */
  refresh() {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item for display
   * @param {ActionItem} element
   * @returns {vscode.TreeItem}
   */
  getTreeItem(element) {
    return element;
  }

  /**
   * Get children of tree element
   * @param {ActionItem} element
   * @returns {Promise<ActionItem[]>}
   */
  async getChildren(element) {
    if (!element) {
      // Root level - return action categories
      return [
        new ActionItem(
          'Model Management',
          vscode.TreeItemCollapsibleState.Expanded,
          'category'
        ),
        new ActionItem(
          'Quick Settings',
          vscode.TreeItemCollapsibleState.Expanded,
          'category'
        ),
        new ActionItem(
          'System Actions',
          vscode.TreeItemCollapsibleState.Expanded,
          'category'
        ),
      ];
    }

    // Return actions based on category
    switch (element.label) {
      case 'Model Management':
        return this.getModelManagementActions();
      case 'Quick Settings':
        return this.getQuickSettingsActions();
      case 'System Actions':
        return this.getSystemActions();
      default:
        return [];
    }
  }

  /**
   * Get model management actions
   * @returns {Promise<ActionItem[]>}
   */
  async getModelManagementActions() {
    const currentSettings = this.settingsService.getAllSettings();

    return [
      new ActionItem(
        `Current: ${currentSettings.model}`,
        vscode.TreeItemCollapsibleState.None,
        'info',
        null,
        'The currently active model'
      ),
      new ActionItem(
        'Change Model',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickChangeModel,
          title: 'Change Model',
        },
        'Switch to a different model'
      ),
      new ActionItem(
        'List Available Models',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickListModels,
          title: 'List Models',
        },
        'View all downloaded models'
      ),
      new ActionItem(
        'Pull New Model',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickPullModel,
          title: 'Pull Model',
        },
        'Download a new model from registry'
      ),
    ];
  }

  /**
   * Get quick settings actions
   * @returns {Promise<ActionItem[]>}
   */
  async getQuickSettingsActions() {
    const currentSettings = this.settingsService.getAllSettings();

    return [
      new ActionItem(
        `Endpoint: ${currentSettings.endpoint}`,
        vscode.TreeItemCollapsibleState.None,
        'info',
        null,
        'Current Ollama endpoint'
      ),
      new ActionItem(
        'Change Endpoint',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickChangeEndpoint,
          title: 'Change Endpoint',
        },
        'Change Ollama API endpoint'
      ),
      new ActionItem(
        `Temperature: ${currentSettings.temperature}`,
        vscode.TreeItemCollapsibleState.None,
        'info',
        null,
        'Current generation temperature'
      ),
      new ActionItem(
        'Set Temperature',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickSetTemperature,
          title: 'Set Temperature',
        },
        'Adjust generation randomness'
      ),
      new ActionItem(
        `Max Tokens: ${currentSettings.maxTokens}`,
        vscode.TreeItemCollapsibleState.None,
        'info',
        null,
        'Current max tokens setting'
      ),
      new ActionItem(
        'Set Max Tokens',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickSetMaxTokens,
          title: 'Set Max Tokens',
        },
        'Change max tokens (300 normal, 30000 thick mode)'
      ),
      new ActionItem(
        `Message Cleanup: ${currentSettings.enableMessageCleanup ? 'Enabled' : 'Disabled'}`,
        vscode.TreeItemCollapsibleState.None,
        'cleanup-info',
        null,
        'Current message cleanup status',
        currentSettings.enableMessageCleanup
      ),
      new ActionItem(
        currentSettings.enableMessageCleanup ? 'Disable Message Cleanup' : 'Enable Message Cleanup',
        vscode.TreeItemCollapsibleState.None,
        'cleanup-action',
        {
          command: COMMAND_IDS.toggleMessageCleanup,
          title: 'Toggle Message Cleanup',
        },
        currentSettings.enableMessageCleanup ? 
          'Disable automatic cleaning of AI responses (use raw output)' : 
          'Enable automatic cleaning of AI responses (remove tags and artifacts)',
        currentSettings.enableMessageCleanup
      ),
    ];
  }

  /**
   * Get system actions
   * @returns {Promise<ActionItem[]>}
   */
  async getSystemActions() {
    return [
      new ActionItem(
        'Open Settings UI',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.openSettings,
          title: 'Open Settings',
        },
        'Open full settings interface'
      ),
      new ActionItem(
        'Reset All Settings',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.quickResetSettings,
          title: 'Reset Settings',
        },
        'Reset to default values'
      ),
      new ActionItem(
        'Generate Commit Message',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.generateCommitMessage,
          title: 'Generate Commit',
        },
        'Generate commit message for current changes'
      ),
      new ActionItem(
        'Enhance Git Message',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.enhanceCommitMessage,
          title: 'Enhance Message',
        },
        'Enhance existing commit message with more detail'
      ),
      new ActionItem(
        'Reduce Message Length',
        vscode.TreeItemCollapsibleState.None,
        'action',
        {
          command: COMMAND_IDS.reduceCommitMessage,
          title: 'Reduce Message',
        },
        'Shorten existing commit message while preserving meaning'
      ),
    ];
  }
}

/**
 * Represents an action item in the tree
 */
class ActionItem extends vscode.TreeItem {
  constructor(label, collapsibleState, type, command = null, tooltip = null, isEnabled = null) {
    super(label, collapsibleState);

    this.command = command;
    this.tooltip = tooltip || label;
    this.contextValue = type;

    // Set icons based on type
    switch (type) {
      case 'category':
        this.iconPath = new vscode.ThemeIcon(
          'folder',
          new vscode.ThemeColor('charts.blue')
        );
        break;
      case 'action':
        this.iconPath = new vscode.ThemeIcon(
          'play',
          new vscode.ThemeColor('charts.green')
        );
        break;
      case 'cleanup-info':
        // Boolean indicator: check mark for enabled, x for disabled
        this.iconPath = new vscode.ThemeIcon(
          isEnabled ? 'check' : 'x',
          new vscode.ThemeColor(isEnabled ? 'testing.iconPassed' : 'testing.iconFailed')
        );
        break;
      case 'cleanup-action':
        // Toggle button: power symbol with color indicating state
        this.iconPath = new vscode.ThemeIcon(
          'circle-filled',
          new vscode.ThemeColor(isEnabled ? 'testing.iconPassed' : 'testing.iconFailed')
        );
        break;
      case 'info':
        this.iconPath = new vscode.ThemeIcon('info');
        break;
      default:
        this.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    // Style info items differently
    if (type === 'info' || type === 'cleanup-info') {
      this.description = '';
      this.resourceUri = vscode.Uri.parse('info://current');
    }
  }
}

module.exports = {
  QuickActionsProvider,
};
