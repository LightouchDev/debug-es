module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:jest/recommended',
    'eslint:recommended',
    'standard'
  ],
  plugins: ['jest'],
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-empty': ['error', { 'allowEmptyCatch': true }]
  }
}
