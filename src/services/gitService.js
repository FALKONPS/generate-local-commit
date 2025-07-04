const vscode = require('vscode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Get the git diff of staged changes with additional context lines
 * @param {number} contextRange - Number of context lines to include above and below changes
 * @returns {Promise<string|null>} The git diff or null if no changes
 */
async function getGitDiff(contextRange = 0) {
  try {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // First check if there are staged changes
    const { stdout: stagedChanges } = await exec(
      'git diff --staged --name-only',
      { cwd: rootPath }
    );

    if (!stagedChanges.trim()) {
      // If no staged changes, check if there are unstaged changes
      const { stdout: unstagedChanges } = await exec('git diff --name-only', {
        cwd: rootPath,
      });

      if (!unstagedChanges.trim()) {
        return null; // No changes at all
      }

      // Get diff of unstaged changes with context
      const { stdout: diff } = await exec(`git diff -U${contextRange}`, {
        cwd: rootPath,
      });
      return diff;
    }

    // Get diff of staged changes with context
    const { stdout: diff } = await exec(`git diff --staged -U${contextRange}`, {
      cwd: rootPath,
    });
    return diff;
  } catch (error) {
    console.error('Git diff error:', error);
    throw new Error(
      'Failed to get git diff. Make sure you are in a git repository.'
    );
  }
}

module.exports = {
  getGitDiff,
};