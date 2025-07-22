const vscode = require('vscode');

/**
 * Service for handling debug mode functionality
 */
class DebugService {
  /**
   * Show debug preview before sending to AI
   * @param {Object} debugInfo - Information to display in debug mode
   * @param {string} debugInfo.diff - Git diff content
   * @param {string} debugInfo.prompt - Full prompt that will be sent to AI
   * @param {string} debugInfo.action - Action being performed (generate, enhance, reduce, pr-summary)
   * @param {Object} debugInfo.settings - Current settings
   * @returns {Promise<boolean>} - True if user wants to proceed, false to cancel
   */
  async showDebugPreview(debugInfo) {
    const { action } = debugInfo;

    // Create debug preview content
    const content = this.createDebugContent(debugInfo);

    // Create and show the debug document
    const doc = await vscode.workspace.openTextDocument({
      content: content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, {
      viewColumn: vscode.ViewColumn.Beside,
      preview: true
    });

    // Show confirmation dialog
    const result = await vscode.window.showInformationMessage(
      `Debug Preview: Review the ${action} details and proceed?`,
      { modal: true },
      'Proceed with AI',
      'Cancel'
    );

    return result === 'Proceed with AI';
  }

  /**
   * Create formatted debug content
   * @param {Object} debugInfo - Debug information
   * @returns {string} - Formatted markdown content
   */
  createDebugContent(debugInfo) {
    const { diff, prompt, action, settings, commitMessage, commits } = debugInfo;
    const timestamp = new Date().toLocaleString();

    let content = `# Debug Preview - ${action.charAt(0).toUpperCase() + action.slice(1)}

**Generated at:** ${timestamp}  
**Action:** ${action}  
**Model:** ${settings.model}  
**Endpoint:** ${settings.endpoint}  

---

## Current Settings

| Setting | Value |
|---------|-------|
| Model | \`${settings.model}\` |
| Temperature | \`${settings.temperature}\` |
| Max Tokens | \`${settings.maxTokens}\` |
| Context Range | \`${settings.contextRange}\` |
| Message Cleanup | \`${settings.enableMessageCleanup ? 'Enabled' : 'Disabled'}\` |
| Conventional Commits | \`${settings.useConventionalCommits ? 'Enabled' : 'Disabled'}\` |

---
`;

    // Add specific content based on action type
    if (action === 'generate') {
      content += `## Git Diff Preview

\`\`\`diff
${diff || 'No diff available'}
\`\`\`

---

## Full Prompt to AI

\`\`\`
${prompt}
\`\`\`
`;
    } else if (action === 'enhance' || action === 'reduce') {
      content += `## Current Commit Message

\`\`\`
${commitMessage || 'No commit message provided'}
\`\`\`

---

## Full Prompt to AI

\`\`\`
${prompt}
\`\`\`
`;
    } else if (action === 'pr-summary') {
      content += `## Recent Commit Messages

${commits ? commits.split('\n').map((commit, i) => `${i + 1}. ${commit}`).join('\n') : 'No commits found'}

---

## Full Prompt to AI

\`\`\`
${prompt}
\`\`\`
`;
    }

    content += `
---

## Next Steps

1. **Review** the information above
2. **Check** the prompt that will be sent to AI
3. **Click "Proceed with AI"** to continue or **"Cancel"** to abort
4. The AI response will be processed according to your current settings

> **Note:** This debug preview helps you understand exactly what data is being sent to the AI model before generation occurs.
`;

    return content;
  }

  /**
   * Show AI response debug information
   * @param {string} rawResponse - Raw response from AI
   * @param {string} cleanedResponse - Cleaned/processed response
   * @param {string} action - Action performed
   * @param {boolean} cleanupEnabled - Whether cleanup was enabled
   */
  async showResponseDebug(rawResponse, cleanedResponse, action, cleanupEnabled) {
    const timestamp = new Date().toLocaleString();

    const content = `# AI Response Debug - ${action.charAt(0).toUpperCase() + action.slice(1)}

**Generated at:** ${timestamp}  
**Cleanup Enabled:** ${cleanupEnabled ? 'Yes' : 'No'}

---

## Raw AI Response

\`\`\`
${rawResponse}
\`\`\`

---

${cleanupEnabled ? `## Cleaned Response

\`\`\`
${cleanedResponse}
\`\`\`

---

## Processing Applied

- Removed thinking tags (\`<think>\`, \`<thinking>\`)
- Removed markdown artifacts (\`\`\`code\`\`\`, **bold**, *italic*)
- Normalized whitespace and formatting
- Extracted content from [COMMIT][/COMMIT] tags (if present)

` : '## Final Response (No Cleanup Applied)\n\nThe raw response above was used as-is since message cleanup is disabled.\n\n'}---

> **Final Result:** The ${cleanupEnabled ? 'cleaned' : 'raw'} response above was ${action === 'generate' ? 'inserted into the commit message box' : action === 'pr-summary' ? 'copied to clipboard and opened in a new document' : 'processed and displayed'}.
`;

    const doc = await vscode.workspace.openTextDocument({
      content: content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, {
      viewColumn: vscode.ViewColumn.Beside,
      preview: true
    });
  }
}

module.exports = {
  DebugService
};
