/**
 * Configuração do Linter ESLint (eslint.config.js)
 *
 * Define as regras estáticas de qualidade de código baseadas nas diretrizes oficiais do Expo.
 * Guia de referência: https://docs.expo.dev/guides/using-eslint/
 */

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
