import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { theme } from './src/theme/theme';
import { TabBar, TabItem } from './src/components/navigation/TabBar';

// As 5 telas do MVP
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SubjectsScreen } from './src/screens/SubjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { GradesScreen } from './src/screens/GradesScreen';
import { FocusScreen } from './src/screens/FocusScreen';

const MainNavigator: React.FC = () => {
  const { isLoading, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const pendingCount = tasks.filter((t) => t.status !== 'Concluído').length;

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'subjects', label: 'Matérias', icon: '📚' },
    { id: 'tasks', label: 'Agenda', icon: '📋', badgeCount: pendingCount },
    { id: 'grades', label: 'Boletim', icon: '📊' },
    { id: 'focus', label: 'Foco', icon: '⏱' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
        return <DashboardScreen onNavigateToTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>{renderScreen()}</View>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
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
