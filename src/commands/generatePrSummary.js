const vscode = require('vscode');
const { getRecentCommitMessages } = require('../services/gitService');
const { generateCommitMessage } = require('../services/ollamaService');
const { SettingsService } = require('../services/settingsService');
const { getDefaultPrSummaryPrompt } = require('../utils/promptTemplate');

/**
 * Generate a pull request summary from recent commit messages
 */
async function generatePrSummaryCommand() {
  try {
    const settingsService = new SettingsService();
    const settings = settingsService.getAllSettings();

    // Get user preferences for commit count and base branch
    const commitCountOptions = [
      { label: '5 commits', value: 5 },
      { label: '10 commits (default)', value: 10 },
      { label: '15 commits', value: 15 },
      { label: '20 commits', value: 20 },
      { label: 'Custom...', value: 'custom' }
    ];

    const selectedCount = await vscode.window.showQuickPick(commitCountOptions, {
      placeHolder: 'How many recent commits to include in PR summary?'
    });

    if (!selectedCount) return;

    let commitCount = selectedCount.value;
    if (selectedCount.value === 'custom') {
      const customCount = await vscode.window.showInputBox({
        prompt: 'Enter number of commits to include',
        placeHolder: '10',
        validateInput: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 50) {
            return 'Must be a number between 1 and 50';
          }
          return null;
        }
      });
      if (!customCount) return;
      commitCount = parseInt(customCount);
    }

    // Ask for base branch
    const baseBranchOptions = [
      { label: 'main (default)', value: 'main' },
      { label: 'master', value: 'master' },
      { label: 'develop', value: 'develop' },
      { label: 'Custom...', value: 'custom' }
    ];

    const selectedBranch = await vscode.window.showQuickPick(baseBranchOptions, {
      placeHolder: 'Select base branch to compare against'
    });

    if (!selectedBranch) return;

    let baseBranch = selectedBranch.value;
    if (selectedBranch.value === 'custom') {
      const customBranch = await vscode.window.showInputBox({
        prompt: 'Enter base branch name',
        placeHolder: 'main'
      });
      if (!customBranch) return;
      baseBranch = customBranch.trim();
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating PR summary...',
        cancellable: false
      },
      async(progress) => {
        progress.report({ increment: 20, message: 'Getting recent commits...' });

        // Get recent commit messages
        const commitMessages = await getRecentCommitMessages(commitCount, baseBranch);

        if (commitMessages.length === 0) {
          vscode.window.showWarningMessage('No commits found. Make sure you have commits in your branch.');
          return;
        }

        progress.report({ increment: 40, message: 'Processing commits...' });

        // Prepare the commits for the prompt
        const commitsText = commitMessages
          .map((commit, index) => `${index + 1}. ${commit}`)
          .join('\n');

        // Get PR summary prompt template
        const prSummaryPrompt = settings.prSummaryPrompt || getDefaultPrSummaryPrompt();
        const prompt = prSummaryPrompt.replace('${commits}', commitsText);

        progress.report({ increment: 60, message: 'Generating summary...' });

        // Generate PR summary
        const summary = await generateCommitMessage(prompt, settings);

        progress.report({ increment: 100 });

        if (!summary || summary.trim() === '') {
          vscode.window.showWarningMessage('Empty PR summary generated. Please try again.');
          return;
        }

        // Show the generated summary in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: summary,
          language: 'markdown'
        });

        await vscode.window.showTextDocument(doc);

        // Also copy to clipboard for convenience
        await vscode.env.clipboard.writeText(summary);

        vscode.window.showInformationMessage(
          `PR summary generated from ${commitMessages.length} commits and copied to clipboard!`
        );
      }
    );
  } catch (error) {
    console.error('Error generating PR summary:', error);
    vscode.window.showErrorMessage(`Failed to generate PR summary: ${error.message}`);
  }
}

module.exports = {
  generatePrSummaryCommand
};
