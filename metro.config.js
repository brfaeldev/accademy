/**
 * Configuração do Bundler Metro (metro.config.js)
 *
 * Configura suporte a assets WebAssembly (.wasm) e cabeçalhos de segurança COOP/COEP
 * para viabilizar a execução do SQLite via SharedArrayBuffer no navegador Web.
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona suporte a arquivos .wasm para o expo-sqlite na Web
config.resolver.assetExts.push('wasm');

// Cabeçalhos HTTP necessários para SharedArrayBuffer no SQLite Web Worker
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;

