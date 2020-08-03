module.exports = {
  env: {
    browser: true,
    es2020: true,
    webextensions: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
    'no-process-env': 0,
  },
  globals: { process: 'readonly' },
};
