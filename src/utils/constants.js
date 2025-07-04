/**
 * Configuration constants for Git Commit Local extension
 */

const DEFAULT_CONFIG = {
  endpoint: 'http://localhost:11434',
  model: 'qwen2.5:3b',
  maxTokens: 300,
  temperature: 0.2,
  contextRange: 3,
  useConventionalCommits: true,
  showDiffConfirmation: false,
};

const CONFIG_SECTION = 'git-commit-local';

const COMMAND_IDS = {
  generateCommitMessage: 'git-commit-local.generateCommitMessage',
  openSettings: 'git-commit-local.openSettings',
  showCommitDiff: 'git-commit-local.showCommitDiff',
};

const VIEW_IDS = {
  settingsView: 'git-commit-local.settingsView',
  historyView: 'git-commit-local.historyView',
};

const VALIDATION_LIMITS = {
  maxTokensMin: 1,
  maxTokensMax: 10000,
  temperatureMin: 0,
  temperatureMax: 2,
  contextRangeMin: 0,
  contextRangeMax: 100,
};

module.exports = {
  DEFAULT_CONFIG,
  CONFIG_SECTION,
  COMMAND_IDS,
  VIEW_IDS,
  VALIDATION_LIMITS,
};