const vscode = require('vscode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Command to show diff for a specific commit
 * @param {string} commitHash - The commit hash to show diff for
 */
async function showCommitDiff(commitHash) {
  try {
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      vscode.window.showWarningMessage('No workspace open');
      return;
    }

    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // Get commit diff
    const { stdout } = await exec(`git show ${commitHash}`, { cwd: rootPath });

    // Create a new untitled document with the diff
    const document = await vscode.workspace.openTextDocument({
      content: stdout,
      language: 'diff'
    });

    // Show the document
    await vscode.window.showTextDocument(document);
  } catch (error) {
    console.error('Error showing commit diff:', error);
    vscode.window.showErrorMessage(
      `Failed to show commit diff: ${error.message}`
    );
  }
}

module.exports = {
  showCommitDiff
};
