const axios = require('axios');
const { extractAndCleanCommitMessage } = require('../utils/messageCleanup');
const { DEFAULT_CONFIG } = require('../utils/constants');

/**
 * Service for interacting with Ollama API
 */
class OllamaService {
  constructor() {
    this.defaultConfig = DEFAULT_CONFIG;
  }

  /**
   * Generate commit message using Ollama API
   * @param {string} prompt - The prompt to send to Ollama
   * @param {object} config - Configuration object with endpoint, model, etc.
   * @returns {Promise<string>} The generated commit message
   */
  async generateCommitMessage(prompt, config = {}) {
    const {
      endpoint = this.defaultConfig.endpoint,
      model = this.defaultConfig.model,
      maxTokens = this.defaultConfig.maxTokens,
      temperature = this.defaultConfig.temperature,
    } = config;

    try {
      const response = await axios.post(`${endpoint}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
        },
      });

      const rawMessage = response.data.response.trim();

      // Extract and clean the commit message
      const message = extractAndCleanCommitMessage(rawMessage);

      return message;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Failed to generate commit message: ${error.message}`);
    }
  }
}

/**
 * Generate commit message using Ollama API (legacy function for backward compatibility)
 * @param {string} prompt - The prompt to send to Ollama
 * @param {object} config - Configuration object with endpoint, model, etc.
 * @returns {Promise<string>} The generated commit message
 */
async function generateCommitMessage(prompt, config) {
  const ollamaService = new OllamaService();
  return ollamaService.generateCommitMessage(prompt, config);
}

module.exports = {
  OllamaService,
  generateCommitMessage,
};
