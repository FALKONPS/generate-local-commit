const vscode = require('vscode');
const { COMMAND_IDS } = require('../utils/constants');
const { SettingsService } = require('../services/settingsService');

/**
 * Tree data provider for prompt management in the sidebar
 */
class PromptManagementProvider {
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
   * @param {PromptItem} element
   * @returns {vscode.TreeItem}
   */
  getTreeItem(element) {
    return element;
  }

  /**
   * Get children of tree element
   * @param {PromptItem} element
   * @returns {Promise<PromptItem[]>}
   */
  async getChildren(element) {
    if (!element) {
      // Root level - return prompt categories
      return [
        new PromptItem(
          'Commit Generation',
          vscode.TreeItemCollapsibleState.Expanded,
          'category',
          'promptTemplate'
        ),
        new PromptItem(
          'Message Enhancement',
          vscode.TreeItemCollapsibleState.Expanded,
          'category',
          'enhancePrompt'
        ),
        new PromptItem(
          'Message Reduction',
          vscode.TreeItemCollapsibleState.Expanded,
          'category',
          'reducePrompt'
        )
      ];
    }

    // Return actions based on category
    switch (element.promptType) {
      case 'promptTemplate':
        return this.getPromptActions('promptTemplate', 'Generate');
      case 'enhancePrompt':
        return this.getPromptActions('enhancePrompt', 'Enhance');
      case 'reducePrompt':
        return this.getPromptActions('reducePrompt', 'Reduce');
      default:
        return [];
    }
  }

  /**
   * Get prompt actions for a specific prompt type
   * @param {string} promptType
   * @param {string} actionLabel
   * @returns {Promise<PromptItem[]>}
   */
  async getPromptActions(promptType, actionLabel) {
    const currentSettings = this.settingsService.getAllSettings();
    const currentPrompt = currentSettings[promptType];

    // Show preview of current prompt (first 100 characters)
    const promptPreview = currentPrompt ?
      (currentPrompt.length > 100 ? currentPrompt.substring(0, 100) + '...' : currentPrompt) :
      'No custom prompt set';

    return [
      new PromptItem(
        'Current Prompt',
        vscode.TreeItemCollapsibleState.None,
        'info',
        promptType,
        null,
        promptPreview
      ),
      new PromptItem(
        'Edit Prompt',
        vscode.TreeItemCollapsibleState.None,
        'action',
        promptType,
        {
          command: COMMAND_IDS.editPrompt,
          title: 'Edit Prompt',
          arguments: [promptType, actionLabel]
        },
        `Edit the ${actionLabel.toLowerCase()} prompt template`
      ),
      new PromptItem(
        'Reset to Default',
        vscode.TreeItemCollapsibleState.None,
        'action',
        promptType,
        {
          command: COMMAND_IDS.resetPrompt,
          title: 'Reset Prompt',
          arguments: [promptType, actionLabel]
        },
        `Reset ${actionLabel.toLowerCase()} prompt to default`
      ),
      new PromptItem(
        'Test Prompt',
        vscode.TreeItemCollapsibleState.None,
        'action',
        promptType,
        {
          command: COMMAND_IDS.testPrompt,
          title: 'Test Prompt',
          arguments: [promptType, actionLabel]
        },
        `Test the ${actionLabel.toLowerCase()} prompt with current changes`
      )
    ];
  }
}

/**
 * Represents a prompt item in the tree
 */
class PromptItem extends vscode.TreeItem {
  constructor(label, collapsibleState, type, promptType = null, command = null, tooltip = null) {
    super(label, collapsibleState);

    this.command = command;
    this.tooltip = tooltip || label;
    this.contextValue = type;
    this.promptType = promptType;

    // Set icons based on type
    switch (type) {
      case 'category':
        this.iconPath = new vscode.ThemeIcon(
          'edit',
          new vscode.ThemeColor('charts.purple')
        );
        break;
      case 'action':
        this.iconPath = new vscode.ThemeIcon(
          'gear',
          new vscode.ThemeColor('charts.green')
        );
        break;
      case 'info':
        this.iconPath = new vscode.ThemeIcon('note');
        break;
      default:
        this.iconPath = new vscode.ThemeIcon('circle-outline');
    }

    // Style info items differently - show as expandable text preview
    if (type === 'info') {
      this.description = '';
      this.resourceUri = vscode.Uri.parse('prompt-info://current');
      this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
  }
}

module.exports = {
  PromptManagementProvider
};
