/**
 * Utility functions for cleaning up AI-generated commit messages
 */

/**
 * Remove thinking tags and their content from the message
 * @param {string} message - The raw message from AI
 * @returns {string} Cleaned message
 */
function removeThinkingTags(message) {
  if (!message || typeof message !== 'string') {
    return message;
  }

  // Remove <think>...</think> tags and their content (case insensitive)
  let cleaned = message.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Remove <thinking>...</thinking> tags and their content (case insensitive)
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  
  return cleaned;
}


/**
 * Remove markdown artifacts that might be added by AI models
 * @param {string} message - The message to clean
 * @returns {string} Cleaned message
 */
function removeMarkdownArtifacts(message) {
  if (!message || typeof message !== 'string') {
    return message;
  }

  let cleaned = message;

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  
  // Remove markdown bold/italic formatting from commit messages
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  
  // Remove backticks around single words
  cleaned = cleaned.replace(/`([^`\n]+)`/g, '$1');
  
  return cleaned;
}

/**
 * Clean up whitespace and formatting issues
 * @param {string} message - The message to clean
 * @returns {string} Cleaned message
 */
function normalizeWhitespace(message) {
  if (!message || typeof message !== 'string') {
    return message;
  }

  let cleaned = message;

  // Remove multiple consecutive newlines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Remove multiple consecutive spaces
  cleaned = cleaned.replace(/  +/g, ' ');
  
  // Remove whitespace at the beginning of lines
  cleaned = cleaned.replace(/^\s+/gm, '');
  
  return cleaned;
}

/**
 * Comprehensive message cleaning function
 * @param {string} rawMessage - The raw message from AI
 * @returns {string} Fully cleaned commit message
 */
function cleanCommitMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return '';
  }

  let cleaned = rawMessage;

  // Apply all cleaning steps in order
  cleaned = removeThinkingTags(cleaned);
  cleaned = removeMarkdownArtifacts(cleaned);
  cleaned = normalizeWhitespace(cleaned);

  // Final check for empty message
  if (!cleaned.trim()) {
    return '';
  }

  return cleaned.trim();
}

/**
 * Extract commit message from [COMMIT][/COMMIT] tags and clean it
 * @param {string} rawMessage - The raw message from AI
 * @returns {string} Extracted and cleaned commit message
 */
function extractAndCleanCommitMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return '';
  }

  let message = rawMessage;

  // First, try to extract from [COMMIT][/COMMIT] tags
  const commitTagRegex = /\[COMMIT\]([\s\S]*?)\[\/COMMIT\]/i;
  const match = rawMessage.match(commitTagRegex);

  if (match && match[1]) {
    message = match[1].trim();
  }

  // Clean the extracted message
  return cleanCommitMessage(message);
}

module.exports = {
  removeThinkingTags,
  removeMarkdownArtifacts,
  normalizeWhitespace,
  cleanCommitMessage,
  extractAndCleanCommitMessage,
};