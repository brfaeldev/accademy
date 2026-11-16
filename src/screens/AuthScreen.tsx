import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { ChipSelector, ChipOption } from '../components/common/ChipSelector';
import { LoginForm } from '../components/domain/LoginForm';
import { RegisterForm, RegisterFormPayload } from '../components/domain/RegisterForm';

type AuthMode = 'login' | 'register';

const AUTH_TABS: ChipOption<AuthMode>[] = [
  { value: 'login', label: '🔑 Entrar (Login)' },
  { value: 'register', label: '📝 Criar Conta' },
];

export const AuthScreen: React.FC = () => {
  const { login, register, availableAccounts } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Não foi possível efetuar o login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (payload: RegisterFormPayload) => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!payload.name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!payload.email.trim() || !payload.email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      return;
    }
    if (payload.password.length < 3) {
      setErrorMessage('A senha precisa ter pelo menos 3 caracteres.');
      return;
    }
    if (payload.password !== payload.confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        course: payload.course,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Falha ao registrar conta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.appTitle}>Academy</Text>
          <Text style={styles.appSubtitle}>
            Gestão Acadêmica de Disciplinas, Tarefas e Notas
          </Text>
        </View>

        <View style={styles.authCard}>
          <ChipSelector
            options={AUTH_TABS}
            value={mode}
            onChange={handleSwitchMode}
            variant="segmented"
            style={styles.modeTabs}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successNotice ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>{successNotice}</Text>
            </View>
          ) : null}

          {mode === 'login' ? (
            <LoginForm
              availableAccounts={availableAccounts}
              isSubmitting={isSubmitting}
              onLogin={handleLoginSubmit}
              onSwitchToRegister={() => handleSwitchMode('register')}
              onQuickFillNotice={setSuccessNotice}
              onClearError={() => setErrorMessage(null)}
            />
          ) : (
            <RegisterForm
              isSubmitting={isSubmitting}
              onRegister={handleRegisterSubmit}
              onSwitchToLogin={() => handleSwitchMode('login')}
              onClearError={() => setErrorMessage(null)}
            />
          )}
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            🔒 Banco de Dados Relacional SQLite • Armazenamento Local Seguro (SHA-256)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    ...theme.shadows.soft,
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  authCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...theme.shadows.medium,
  },
  modeTabs: {
    marginBottom: theme.spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.dangerText,
    lineHeight: 18,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  footerNote: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
