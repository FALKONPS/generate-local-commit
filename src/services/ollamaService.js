const axios = require('axios');
const { extractAndCleanCommitMessage } = require('../utils/messageCleanup');

/**
 * Generate commit message using Ollama API
 * @param {string} prompt - The prompt to send to Ollama
 * @param {object} config - Configuration object with endpoint, model, etc.
 * @returns {Promise<string>} The generated commit message
 */
async function generateCommitMessage(prompt, config) {
  const {
    endpoint = 'http://localhost:11434',
    model = 'qwen2.5:3b',
    maxTokens = 300,
    temperature = 0.2,
  } = config;

  try {
    const response = await axios.post(
      `${endpoint}/api/generate`,
      {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
        },
      }
    );

    const rawMessage = response.data.response.trim();

    // Extract and clean the commit message
    const message = extractAndCleanCommitMessage(rawMessage);

    return message;
  } catch (error) {
    console.error('Ollama API error:', error);
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}

module.exports = {
  generateCommitMessage,
};