const vscode = require('vscode');
const { DEFAULT_CONFIG, CONFIG_SECTION, VALIDATION_LIMITS } = require('../utils/constants');

/**
 * Service for managing extension settings
 */
class SettingsService {
  constructor() {
    this.configSection = CONFIG_SECTION;
  }

  /**
   * Get all current settings
   * @returns {object} Current settings object
   */
  getAllSettings() {
    const config = vscode.workspace.getConfiguration(this.configSection);
    return {
      endpoint: config.get('endpoint') || DEFAULT_CONFIG.endpoint,
      model: config.get('model') || DEFAULT_CONFIG.model,
      maxTokens: config.get('maxTokens') || DEFAULT_CONFIG.maxTokens,
      temperature: config.get('temperature') || DEFAULT_CONFIG.temperature,
      contextRange: config.get('contextRange') || DEFAULT_CONFIG.contextRange,
      promptTemplate: config.get('promptTemplate') || this.getDefaultPromptTemplate(),
      useConventionalCommits: config.get('useConventionalCommits') !== false,
      showDiffConfirmation: config.get('showDiffConfirmation') || DEFAULT_CONFIG.showDiffConfirmation,
    };
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {Promise<void>}
   */
  async updateSetting(key, value) {
    const config = vscode.workspace.getConfiguration(this.configSection);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Update multiple settings at once
   * @param {object} settings - Object with key-value pairs to update
   * @returns {Promise<void>}
   */
  async updateSettings(settings) {
    const config = vscode.workspace.getConfiguration(this.configSection);
    const promises = Object.entries(settings).map(([key, value]) =>
      config.update(key, value, vscode.ConfigurationTarget.Global)
    );
    await Promise.all(promises);
  }

  /**
   * Reset all settings to default values
   * @returns {Promise<void>}
   */
  async resetToDefaults() {
    const defaultSettings = {
      ...DEFAULT_CONFIG,
      promptTemplate: this.getDefaultPromptTemplate(),
    };
    await this.updateSettings(defaultSettings);
  }

  /**
   * Get the default prompt template
   * @returns {string} Default prompt template
   */
  getDefaultPromptTemplate() {
    return `You are an AI assistant specialized in creating concise and meaningful git commit messages. When provided with a git diff, your task is to generate a clear commit message following the conventional commit format.

Your commit messages should:
1. Follow the pattern: type(optional scope): description
2. Use one of these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Focus on WHAT changed and WHY, not HOW it was implemented
4. Be under 50 characters whenever possible
5. Use imperative, present tense (e.g., "add feature" not "added feature")
6. Generate the git commit message inside [COMMIT][/COMMIT] tags based on the content of the diff provided inside [DIFF][/DIFF] tags

Types explained:
- feat: A new feature or significant enhancement
- fix: A bug fix
- docs: Documentation changes only
- style: Changes that don't affect code meaning (formatting, whitespace)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or correcting tests
- build: Changes to build system or dependencies
- ci: Changes to CI configuration/scripts
- chore: Routine maintenance tasks, dependency updates

[DIFF]\${diff}[/DIFF]`;
  }

  /**
   * Validate settings values
   * @param {object} settings - Settings to validate
   * @returns {object} Validation result with isValid and errors
   */
  validateSettings(settings) {
    const errors = [];

    // Validate endpoint URL
    if (settings.endpoint && !this.isValidUrl(settings.endpoint)) {
      errors.push('Endpoint must be a valid URL');
    }

    // Validate model name
    if (settings.model && settings.model.trim() === '') {
      errors.push('Model name cannot be empty');
    }

    // Validate maxTokens
    if (settings.maxTokens !== undefined && (settings.maxTokens < VALIDATION_LIMITS.maxTokensMin || settings.maxTokens > VALIDATION_LIMITS.maxTokensMax)) {
      errors.push(`Max tokens must be between ${VALIDATION_LIMITS.maxTokensMin} and ${VALIDATION_LIMITS.maxTokensMax}`);
    }

    // Validate temperature
    if (settings.temperature !== undefined && (settings.temperature < VALIDATION_LIMITS.temperatureMin || settings.temperature > VALIDATION_LIMITS.temperatureMax)) {
      errors.push(`Temperature must be between ${VALIDATION_LIMITS.temperatureMin} and ${VALIDATION_LIMITS.temperatureMax}`);
    }

    // Validate contextRange
    if (settings.contextRange !== undefined && (settings.contextRange < VALIDATION_LIMITS.contextRangeMin || settings.contextRange > VALIDATION_LIMITS.contextRangeMax)) {
      errors.push(`Context range must be between ${VALIDATION_LIMITS.contextRangeMin} and ${VALIDATION_LIMITS.contextRangeMax}`);
    }

    // Validate prompt template
    if (settings.promptTemplate && !settings.promptTemplate.includes('${diff}')) {
      errors.push('Prompt template must contain the ${diff} placeholder');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a string is a valid URL
   * @param {string} str - String to validate
   * @returns {boolean} Whether the string is a valid URL
   */
  isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = {
  SettingsService,
};