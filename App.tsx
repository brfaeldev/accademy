import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { theme } from './src/theme/theme';
import { TabBar, TabItem } from './src/components/navigation/TabBar';

// As 6 telas da aplicação
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SubjectsScreen } from './src/screens/SubjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { GradesScreen } from './src/screens/GradesScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { AuthScreen } from './src/screens/AuthScreen';

const VALID_TABS = ['dashboard', 'subjects', 'tasks', 'grades', 'focus'];

function getInitialWebTab(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').trim();
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
  }
  return 'dashboard';
}

const MainNavigator: React.FC = () => {
  const { isLoading, tasks, currentUser, pomodoro } = useApp();
  const [activeTab, setActiveTab] = useState<string>(getInitialWebTab);

  const navigateToTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  }, []);

  // Suporte ao botão físico "Voltar" do Android: retorna ao Dashboard antes de fechar o app
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeTab !== 'dashboard') {
        navigateToTab('dashboard');
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [activeTab, navigateToTab]);

  // Suporte à mudança de hash (botão voltar do navegador) na Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Se o usuário não estiver autenticado, exibe a tela de login / criação de conta
  if (!currentUser) {
    return <AuthScreen />;
  }

  const pendingCount = tasks.filter((t) => t.status !== 'Concluído').length;

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'subjects', label: 'Matérias', icon: '📚' },
    { id: 'tasks', label: 'Agenda', icon: '📋', badgeCount: pendingCount },
    { id: 'grades', label: 'Boletim', icon: '📊' },
    {
      id: 'focus',
      label: pomodoro.isActive ? `Foco (${pomodoro.timeFormatted})` : 'Foco',
      icon: pomodoro.isActive ? '🔥' : '⏱',
    },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'subjects':
        return <SubjectsScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'grades':
        return <GradesScreen />;
      case 'focus':
        return <FocusScreen />;
      case 'dashboard':
      default:
        return <DashboardScreen onNavigateToTab={navigateToTab} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>{renderScreen()}</View>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={navigateToTab}
      />
    </View>
  );
};

export default function App() {
  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
