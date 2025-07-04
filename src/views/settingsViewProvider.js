const vscode = require('vscode');
const { SettingsService } = require('../services/settingsService');

/**
 * Webview provider for the settings UI
 */
class SettingsViewProvider {
  constructor(context) {
    this.context = context;
    this.settingsService = new SettingsService();
    this._view = undefined;
  }

  /**
   * Resolve the webview view
   * @param {vscode.WebviewView} webviewView
   * @param {vscode.WebviewViewResolveContext} context
   * @param {vscode.CancellationToken} token
   */
  resolveWebviewView(webviewView, context, token) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getWebviewContent();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case 'loadSettings':
            await this.loadSettings();
            break;
          case 'saveSettings':
            await this.saveSettings(message.settings);
            break;
          case 'resetSettings':
            await this.resetSettings();
            break;
          case 'testConnection':
            await this.testConnection(message.endpoint, message.model);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    // Load settings when view is first created
    this.loadSettings();
  }

  /**
   * Load current settings and send to webview
   */
  async loadSettings() {
    if (!this._view) return;

    const settings = this.settingsService.getAllSettings();
    this._view.webview.postMessage({
      type: 'settingsLoaded',
      settings,
    });
  }

  /**
   * Save settings from webview
   * @param {object} settings - Settings to save
   */
  async saveSettings(settings) {
    if (!this._view) return;

    try {
      // Validate settings
      const validation = this.settingsService.validateSettings(settings);
      if (!validation.isValid) {
        this._view.webview.postMessage({
          type: 'validationError',
          errors: validation.errors,
        });
        return;
      }

      // Save settings
      await this.settingsService.updateSettings(settings);
      
      this._view.webview.postMessage({
        type: 'settingsSaved',
        message: 'Settings saved successfully!',
      });

      vscode.window.showInformationMessage('Git Commit Local settings saved successfully!');
    } catch (error) {
      this._view.webview.postMessage({
        type: 'error',
        message: `Failed to save settings: ${error.message}`,
      });
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    if (!this._view) return;

    try {
      await this.settingsService.resetToDefaults();
      await this.loadSettings();
      
      this._view.webview.postMessage({
        type: 'settingsReset',
        message: 'Settings reset to defaults!',
      });

      vscode.window.showInformationMessage('Settings reset to defaults!');
    } catch (error) {
      this._view.webview.postMessage({
        type: 'error',
        message: `Failed to reset settings: ${error.message}`,
      });
    }
  }

  /**
   * Test connection to Ollama
   * @param {string} endpoint - Ollama endpoint
   * @param {string} model - Model name
   */
  async testConnection(endpoint, model) {
    if (!this._view) return;

    try {
      const axios = require('axios');
      
      // Test basic connection
      const response = await axios.get(`${endpoint}/api/tags`, { timeout: 5000 });
      
      // Check if the specified model is available
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name === model);
      
      if (modelExists) {
        this._view.webview.postMessage({
          type: 'connectionSuccess',
          message: `✅ Connection successful! Model "${model}" is available.`,
        });
      } else {
        this._view.webview.postMessage({
          type: 'connectionWarning',
          message: `⚠️ Connection successful, but model "${model}" is not available. Available models: ${models.map(m => m.name).join(', ')}`,
        });
      }
    } catch (error) {
      this._view.webview.postMessage({
        type: 'connectionError',
        message: `❌ Connection failed: ${error.message}`,
      });
    }
  }

  /**
   * Get the HTML content for the webview
   * @returns {string} HTML content
   */
  getWebviewContent() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Commit Local Settings</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            margin: 0;
        }
        
        .container {
            max-width: 100%;
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        label {
            display: block;
            margin-bottom: 4px;
            font-weight: bold;
            color: var(--vscode-foreground);
        }
        
        input[type="text"], input[type="number"], textarea, select {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 2px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            box-sizing: border-box;
        }
        
        input[type="checkbox"] {
            margin-right: 8px;
        }
        
        textarea {
            height: 120px;
            resize: vertical;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        
        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            margin-right: 8px;
            margin-bottom: 8px;
        }
        
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .button.test {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-button-foreground);
        }
        
        .message {
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 16px;
            display: none;
        }
        
        .message.success {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-button-foreground);
        }
        
        .message.error {
            background-color: var(--vscode-testing-iconFailed);
            color: var(--vscode-button-foreground);
        }
        
        .message.warning {
            background-color: var(--vscode-testing-iconSkipped);
            color: var(--vscode-button-foreground);
        }
        
        .description {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 2px;
        }
        
        .section {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .checkbox-group label {
            margin-bottom: 0;
            margin-left: 0;
            font-weight: normal;
        }
        
        .button-group {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }
        
        .connection-test {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Git Commit Local Settings</h2>
        
        <div id="message" class="message"></div>
        
        <form id="settingsForm">
            <div class="section">
                <div class="section-title">Ollama Configuration</div>
                
                <div class="form-group">
                    <label for="endpoint">Ollama Endpoint</label>
                    <input type="text" id="endpoint" name="endpoint" placeholder="http://localhost:11434">
                    <div class="description">URL of your Ollama API endpoint</div>
                </div>
                
                <div class="form-group">
                    <label for="model">Model</label>
                    <input type="text" id="model" name="model" placeholder="qwen2.5:3b">
                    <div class="description">Ollama model to use for generating commit messages</div>
                </div>
                
                <div class="connection-test">
                    <button type="button" class="button test" id="testConnection">Test Connection</button>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Generation Settings</div>
                
                <div class="form-group">
                    <label for="maxTokens">Max Tokens</label>
                    <input type="number" id="maxTokens" name="maxTokens" min="1" max="10000" value="300">
                    <div class="description">Maximum number of tokens to generate (1-10000)</div>
                </div>
                
                <div class="form-group">
                    <label for="temperature">Temperature</label>
                    <input type="number" id="temperature" name="temperature" min="0" max="2" step="0.1" value="0.2">
                    <div class="description">Randomness of generation (0 = deterministic, 2 = very random)</div>
                </div>
                
                <div class="form-group">
                    <label for="contextRange">Context Range</label>
                    <input type="number" id="contextRange" name="contextRange" min="0" max="100" value="3">
                    <div class="description">Number of context lines to include around changes (0-100)</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Behavior Settings</div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="useConventionalCommits" name="useConventionalCommits" checked>
                    <label for="useConventionalCommits">Use Conventional Commits Format</label>
                </div>
                <div class="description">Follow conventional commits format (feat:, fix:, docs:, etc.)</div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="showDiffConfirmation" name="showDiffConfirmation">
                    <label for="showDiffConfirmation">Show Diff Confirmation</label>
                </div>
                <div class="description">Show a confirmation dialog with the diff before generating</div>
            </div>
            
            <div class="section">
                <div class="section-title">Prompt Template</div>
                
                <div class="form-group">
                    <label for="promptTemplate">Custom Prompt Template</label>
                    <textarea id="promptTemplate" name="promptTemplate" placeholder="Enter your custom prompt template..."></textarea>
                    <div class="description">Custom prompt template (must contain \${diff} placeholder)</div>
                </div>
            </div>
            
            <div class="button-group">
                <button type="submit" class="button">Save Settings</button>
                <button type="button" class="button secondary" id="resetSettings">Reset to Defaults</button>
            </div>
        </form>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // DOM elements
        const form = document.getElementById('settingsForm');
        const messageDiv = document.getElementById('message');
        const testConnectionBtn = document.getElementById('testConnection');
        const resetSettingsBtn = document.getElementById('resetSettings');
        
        // Load settings on startup
        vscode.postMessage({ type: 'loadSettings' });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const settings = {
                endpoint: formData.get('endpoint'),
                model: formData.get('model'),
                maxTokens: parseInt(formData.get('maxTokens')),
                temperature: parseFloat(formData.get('temperature')),
                contextRange: parseInt(formData.get('contextRange')),
                useConventionalCommits: formData.get('useConventionalCommits') === 'on',
                showDiffConfirmation: formData.get('showDiffConfirmation') === 'on',
                promptTemplate: formData.get('promptTemplate'),
            };
            
            vscode.postMessage({ type: 'saveSettings', settings });
        });
        
        // Test connection
        testConnectionBtn.addEventListener('click', () => {
            const endpoint = document.getElementById('endpoint').value;
            const model = document.getElementById('model').value;
            
            if (!endpoint || !model) {
                showMessage('Please fill in endpoint and model fields first', 'error');
                return;
            }
            
            vscode.postMessage({ type: 'testConnection', endpoint, model });
        });
        
        // Reset settings
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to their default values?')) {
                vscode.postMessage({ type: 'resetSettings' });
            }
        });
        
        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;
            
            switch (message.type) {
                case 'settingsLoaded':
                    populateForm(message.settings);
                    break;
                case 'settingsSaved':
                    showMessage(message.message, 'success');
                    break;
                case 'settingsReset':
                    showMessage(message.message, 'success');
                    break;
                case 'validationError':
                    showMessage('Validation errors: ' + message.errors.join(', '), 'error');
                    break;
                case 'connectionSuccess':
                    showMessage(message.message, 'success');
                    break;
                case 'connectionWarning':
                    showMessage(message.message, 'warning');
                    break;
                case 'connectionError':
                    showMessage(message.message, 'error');
                    break;
                case 'error':
                    showMessage(message.message, 'error');
                    break;
            }
        });
        
        function populateForm(settings) {
            document.getElementById('endpoint').value = settings.endpoint || '';
            document.getElementById('model').value = settings.model || '';
            document.getElementById('maxTokens').value = settings.maxTokens || 300;
            document.getElementById('temperature').value = settings.temperature || 0.2;
            document.getElementById('contextRange').value = settings.contextRange || 3;
            document.getElementById('useConventionalCommits').checked = settings.useConventionalCommits !== false;
            document.getElementById('showDiffConfirmation').checked = settings.showDiffConfirmation || false;
            document.getElementById('promptTemplate').value = settings.promptTemplate || '';
        }
        
        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    </script>
</body>
</html>`;
  }
}

module.exports = {
  SettingsViewProvider,
};