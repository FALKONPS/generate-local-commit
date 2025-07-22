const vscode = require('vscode');
const {
  DEFAULT_CONFIG,
  CONFIG_SECTION,
  VALIDATION_LIMITS
} = require('../utils/constants');
const { getDefaultPromptTemplate, getDefaultEnhancePrompt, getDefaultReducePrompt, getDefaultPrSummaryPrompt } = require('../utils/promptTemplate');

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
      promptTemplate:
        config.get('promptTemplate') || getDefaultPromptTemplate(),
      useConventionalCommits: config.get('useConventionalCommits') !== false,
      showDiffConfirmation:
        config.get('showDiffConfirmation') ||
        DEFAULT_CONFIG.showDiffConfirmation,
      enhancePrompt:
        config.get('enhancePrompt') || getDefaultEnhancePrompt(),
      reducePrompt: config.get('reducePrompt') || getDefaultReducePrompt(),
      prSummaryPrompt:
        config.get('prSummaryPrompt') || getDefaultPrSummaryPrompt(),
      enableMessageCleanup: config.get('enableMessageCleanup') !== false,
      enableDebugMode: config.get('enableDebugMode') === true
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
      promptTemplate: getDefaultPromptTemplate()
    };
    await this.updateSettings(defaultSettings);
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
    if (
      settings.maxTokens !== undefined &&
      (settings.maxTokens < VALIDATION_LIMITS.maxTokensMin ||
        settings.maxTokens > VALIDATION_LIMITS.maxTokensMax)
    ) {
      errors.push(
        `Max tokens must be between ${VALIDATION_LIMITS.maxTokensMin} and ${VALIDATION_LIMITS.maxTokensMax}`
      );
    }

    // Validate temperature
    if (
      settings.temperature !== undefined &&
      (settings.temperature < VALIDATION_LIMITS.temperatureMin ||
        settings.temperature > VALIDATION_LIMITS.temperatureMax)
    ) {
      errors.push(
        `Temperature must be between ${VALIDATION_LIMITS.temperatureMin} and ${VALIDATION_LIMITS.temperatureMax}`
      );
    }

    // Validate contextRange
    if (
      settings.contextRange !== undefined &&
      (settings.contextRange < VALIDATION_LIMITS.contextRangeMin ||
        settings.contextRange > VALIDATION_LIMITS.contextRangeMax)
    ) {
      errors.push(
        `Context range must be between ${VALIDATION_LIMITS.contextRangeMin} and ${VALIDATION_LIMITS.contextRangeMax}`
      );
    }

    // Validate prompt template
    if (
      settings.promptTemplate &&
      !settings.promptTemplate.includes('${diff}')
    ) {
      errors.push('Prompt template must contain the ${diff} placeholder');
    }

    return {
      isValid: errors.length === 0,
      errors
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
  SettingsService
};
