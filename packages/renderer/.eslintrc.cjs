module.exports = {
  extends: [
    '@ameinhardt/eslint-config/vue'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: ['components.d.ts', 'index.html'],
  rules: {
    'no-console': ['warn', { allow: ['log', 'info', 'warn', 'error'] }],
    'import/no-unresolved': ['error', {
      ignore: ['^~icons/', '^virtual:.*']
    }],
    'unicorn/prefer-top-level-await': 'off'
  }
};
