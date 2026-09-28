import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react },
    rules: { 'react/jsx-uses-vars': 'error' },
    languageOptions: { ecmaVersion: 2022, globals: globals.browser, parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' } },
  },
  { files: ['**/*.test.{js,jsx}'], languageOptions: { globals: globals.jest } },
  { files: ['src/context/**/*.jsx'], rules: { 'react-refresh/only-export-components': 'off' } },
  { files: ['scripts/**/*.js', 'playwright.config.js'], languageOptions: { globals: globals.node } },
  { files: ['src/components/TurnstileWidget.jsx'], rules: { 'react-refresh/only-export-components': 'off' } },
];
