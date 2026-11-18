/**
 * Ponto de Entrada da Aplicação (index.ts)
 *
 * Registra o componente raiz no ecossistema Expo/React Native e inicializa
 * o Service Worker para suporte a Progressive Web App (PWA) no navegador.
 */

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Registra o Service Worker caso a aplicação seja executada no navegador Web (PWA)
if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado no escopo:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', error);
      });
  });
}

// O registerRootComponent invoca AppRegistry.registerComponent('main', () => App);
// Também garante a configuração apropriada do ambiente, seja no Expo Go ou em build nativo
registerRootComponent(App);
