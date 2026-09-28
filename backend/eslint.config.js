import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['coverage'] },
  { files: ['**/*.js'], ...js.configs.recommended, languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.node } },
  { files: ['**/*.test.js'], languageOptions: { globals: globals.jest } },
];
