module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:jest/recommended',
    'eslint:recommended',
    'standard'
  ],
  plugins: ['jest'],
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-empty': ['error', { allowEmptyCatch: true }]
  }
}
