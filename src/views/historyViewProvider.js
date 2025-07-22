const vscode = require('vscode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { COMMAND_IDS } = require('../utils/constants');

/**
 * Tree data provider for recent commits history
 */
class HistoryViewProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  /**
   * Refresh the tree view
   */
  refresh() {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item for display
   * @param {CommitItem} element
   * @returns {vscode.TreeItem}
   */
  getTreeItem(element) {
    return element;
  }

  /**
   * Get children of tree element
   * @param {CommitItem} element
   * @returns {Promise<CommitItem[]>}
   */
  async getChildren(element) {
    if (!element) {
      // Root level - return recent commits
      return this.getRecentCommits();
    }
    return [];
  }

  /**
   * Get recent commits from git log
   * @returns {Promise<CommitItem[]>}
   */
  async getRecentCommits() {
    try {
      if (
        !vscode.workspace.workspaceFolders ||
        vscode.workspace.workspaceFolders.length === 0
      ) {
        return [new CommitItem('No workspace open', '', 'info')];
      }

      const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

      // Get recent commits with format: hash|author|date|message
      const { stdout } = await exec(
        'git log --oneline --format="%H|%an|%ar|%s" -10',
        { cwd: rootPath }
      );

      if (!stdout.trim()) {
        return [new CommitItem('No commits found', '', 'info')];
      }

      const commits = stdout
        .trim()
        .split('\n')
        .map((line) => {
          const [hash, author, date, message] = line.split('|');
          const shortHash = hash.substring(0, 7);
          const tooltip = `${message}\n\nAuthor: ${author}\nDate: ${date}\nHash: ${shortHash}`;

          return new CommitItem(`${shortHash}: ${message}`, tooltip, 'commit', {
            command: COMMAND_IDS.showCommitDiff,
            title: 'Show Diff',
            arguments: [hash]
          });
        });

      return commits;
    } catch (error) {
      console.error('Error getting git history:', error);
      return [new CommitItem('Error loading commits', error.message, 'error')];
    }
  }
}

/**
 * Represents a commit item in the tree
 */
class CommitItem extends vscode.TreeItem {
  constructor(label, tooltip, type, command = null) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = tooltip;
    this.command = command;

    // Set icons based on type
    switch (type) {
      case 'commit':
        this.iconPath = new vscode.ThemeIcon('git-commit');
        break;
      case 'info':
        this.iconPath = new vscode.ThemeIcon('info');
        break;
      case 'error':
        this.iconPath = new vscode.ThemeIcon('error');
        break;
    }
  }
}

module.exports = {
  HistoryViewProvider
};
