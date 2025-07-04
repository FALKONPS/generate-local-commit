/**
 * Configuration constants for Generate Local Commit extension
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

const CONFIG_SECTION = 'generate-local-commit';

const COMMAND_IDS = {
  generateCommitMessage: 'generate-local-commit.generateCommitMessage',
  openSettings: 'generate-local-commit.openSettings',
  showCommitDiff: 'generate-local-commit.showCommitDiff',
  quickChangeModel: 'generate-local-commit.quickChangeModel',
  quickChangeEndpoint: 'generate-local-commit.quickChangeEndpoint',
  quickPullModel: 'generate-local-commit.quickPullModel',
  quickListModels: 'generate-local-commit.quickListModels',
  quickSetTemperature: 'generate-local-commit.quickSetTemperature',
  quickSetMaxTokens: 'generate-local-commit.quickSetMaxTokens',
  quickResetSettings: 'generate-local-commit.quickResetSettings',
  enhanceCommitMessage: 'generate-local-commit.enhanceCommitMessage',
  reduceCommitMessage: 'generate-local-commit.reduceCommitMessage',
};

const VIEW_IDS = {
  quickActionsView: 'generate-local-commit.quickActionsView',
  historyView: 'generate-local-commit.historyView',
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
