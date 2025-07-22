const vscode = require('vscode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Get recent commit messages from the current branch
 * @param {number} count - Number of recent commits to get (default: 10)
 * @param {string} baseBranch - Base branch to compare against (default: 'main')
 * @returns {Promise<string[]>} Array of commit messages
 */
async function getRecentCommitMessages(count = 10, baseBranch = 'main') {
  try {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    let commits = '';
    let gitCommand = '';

    try {
      // First, try to get commits between base branch and HEAD
      await exec(`git rev-parse --verify ${baseBranch}`, { cwd: rootPath });
      gitCommand = `git log ${baseBranch}..HEAD --pretty=format:"%s" --no-merges`;
      const result = await exec(gitCommand, { cwd: rootPath });
      commits = result.stdout;

      // If no commits between base and HEAD, try to get recent commits from current branch
      if (!commits.trim()) {
        gitCommand = `git log -${count} --pretty=format:"%s" --no-merges`;
        const fallbackResult = await exec(gitCommand, { cwd: rootPath });
        commits = fallbackResult.stdout;
      }
    } catch (baseBranchError) {
      // Base branch doesn't exist, get recent commits from current branch
      try {
        gitCommand = `git log -${count} --pretty=format:"%s" --no-merges`;
        const fallbackResult = await exec(gitCommand, { cwd: rootPath });
        commits = fallbackResult.stdout;
      } catch (fallbackError) {
        // Try without --no-merges in case that's causing issues
        gitCommand = `git log -${count} --pretty=format:"%s"`;
        const finalResult = await exec(gitCommand, { cwd: rootPath });
        commits = finalResult.stdout;
      }
    }

    if (!commits.trim()) {
      return [];
    }

    return commits.split('\n')
      .filter(commit => commit.trim() !== '')
      .slice(0, count); // Ensure we don't exceed the requested count
  } catch (error) {
    console.error('Git commit messages error:', error);
    throw new Error('Failed to get recent commit messages. Make sure you are in a git repository with at least one commit.');
  }
}

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
        cwd: rootPath
      });

      if (!unstagedChanges.trim()) {
        return null; // No changes at all
      }

      // Get diff of unstaged changes with context
      const { stdout: diff } = await exec(`git diff -U${contextRange}`, {
        cwd: rootPath
      });
      return diff;
    }

    // Get diff of staged changes with context
    const { stdout: diff } = await exec(`git diff --staged -U${contextRange}`, {
      cwd: rootPath
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
  getRecentCommitMessages
};
