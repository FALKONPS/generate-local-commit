import globals from 'globals';

export default [
  {
    ignores: ['.vscode-test/**', 'test/**', 'out/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
      },

      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },

    rules: {
      // Basic errors
      'no-const-assign': 'warn',
      'no-this-before-super': 'warn',
      'no-undef': 'warn',
      'no-unreachable': 'warn',
      'no-unused-vars': 'warn',
      'constructor-super': 'warn',
      'valid-typeof': 'warn',

      // Whitespace and formatting rules (fixable)
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
      'eol-last': ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'no-multi-spaces': 'error',
      'no-whitespace-before-property': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],

      // Code style
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-spacing': ['error', { before: true, after: true }],
      'template-curly-spacing': ['error', 'never'],
    },
  },
];
