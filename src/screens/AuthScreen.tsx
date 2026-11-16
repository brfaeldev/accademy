import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Button } from '../components/common/Button';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const { login, register, availableAccounts } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');

  // Formulário Login
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Formulário Cadastro
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regCourse, setRegCourse] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Estados de feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Alterna entre Login e Cadastro limpando erros
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  // Preenche e-mail de conta existente com 1 toque
  const handleQuickFill = (email: string) => {
    setLoginEmail(email);
    setErrorMessage(null);
    setSuccessNotice(`E-mail ${email} preenchido. Digite sua senha para entrar.`);
  };

  // Submissão do Login
  const handleLoginSubmit = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Não foi possível efetuar o login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão do Cadastro
  const handleRegisterSubmit = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!regName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      return;
    }
    if (regPassword.length < 3) {
      setErrorMessage('A senha precisa ter pelo menos 3 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        course: regCourse,
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
        {/* Cabeçalho de Marca */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.appTitle}>Academy</Text>
          <Text style={styles.appSubtitle}>
            Gestão Acadêmica de Disciplinas, Tarefas e Notas
          </Text>
        </View>

        {/* Card Principal de Autenticação */}
        <View style={styles.authCard}>
          {/* Seletor de Modo (Abas) */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
              onPress={() => handleSwitchMode('login')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabButtonText, mode === 'login' && styles.tabButtonTextActive]}
              >
                🔑 Entrar (Login)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
              onPress={() => handleSwitchMode('register')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  mode === 'register' && styles.tabButtonTextActive,
                ]}
              >
                📝 Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Banner de Mensagem de Erro */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Banner de Aviso de Sucesso / Dica */}
          {successNotice ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>{successNotice}</Text>
            </View>
          ) : null}

          {/* ================= FORMLÁRIO DE LOGIN ================= */}
          {mode === 'login' ? (
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Acessar Conta</Text>
                <Text style={styles.formDesc}>
                  O sistema valida contas existentes no banco e permite login somente delas.
                </Text>
              </View>

              <Text style={styles.inputLabel}>E-mail de Cadastro</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>✉️</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ex: bruno@academy.com"
                  placeholderTextColor={theme.colors.textMuted}
                  value={loginEmail}
                  onChangeText={(text) => {
                    setLoginEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.inputLabel}>Senha de Acesso</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Sua senha"
                  placeholderTextColor={theme.colors.textMuted}
                  value={loginPassword}
                  onChangeText={(text) => {
                    setLoginPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showLoginPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowLoginPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showLoginPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={isSubmitting ? 'Verificando no Banco...' : 'Entrar no Sistema'}
                variant="primary"
                onPress={handleLoginSubmit}
                loading={isSubmitting}
                style={styles.actionBtn}
              />

              {/* Contas existentes no banco SQLite */}
              {availableAccounts && availableAccounts.length > 0 ? (
                <View style={styles.quickFillContainer}>
                  <View style={styles.quickFillHeader}>
                    <Text style={styles.quickFillTitle}>
                      🗄️ Contas cadastradas no SQLite:
                    </Text>
                    <Text style={styles.quickFillSubtitle}>
                      Toque em uma conta para preencher o e-mail
                    </Text>
                  </View>
                  <View style={styles.accountsList}>
                    {availableAccounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        style={styles.accountCard}
                        onPress={() => handleQuickFill(acc.email)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.accountCardHeader}>
                          <Text style={styles.accountCardName}>👤 {acc.name}</Text>
                          {acc.course ? (
                            <Text style={styles.accountCardBadge}>{acc.course}</Text>
                          ) : null}
                        </View>
                        <Text style={styles.accountCardEmail}>{acc.email}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.quickFillContainer}>
                  <Text style={styles.quickFillSubtitle}>
                    Nenhuma conta cadastrada ainda. Crie sua conta na aba &quot;Criar Conta&quot;.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.switchModeLink}
                onPress={() => handleSwitchMode('register')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchModeText}>
                  Ainda não tem conta?{' '}
                  <Text style={styles.switchModeHighlight}>Cadastre-se aqui</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= FORMLÁRIO DE CADASTRO ================= */
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Criar Nova Conta</Text>
                <Text style={styles.formDesc}>
                  Sua conta será salva no banco SQLite local para que você possa efetuar login.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Carlos Ferreira"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regName}
                  onChangeText={(text) => {
                    setRegName(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.inputLabel}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>✉️</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: carlos@fho.edu.br"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regEmail}
                  onChangeText={(text) => {
                    setRegEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.inputLabel}>Curso / Graduação (opcional)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>🎓</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Engenharia de Software"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regCourse}
                  onChangeText={setRegCourse}
                />
              </View>

              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mínimo de 3 caracteres"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regPassword}
                  onChangeText={(text) => {
                    setRegPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowRegPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showRegPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirmar Senha</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Repita a senha digitada"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regConfirmPassword}
                  onChangeText={(text) => {
                    setRegConfirmPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Button
                title={isSubmitting ? 'Criando Conta...' : 'Cadastrar e Acessar'}
                variant="primary"
                onPress={handleRegisterSubmit}
                loading={isSubmitting}
                style={styles.actionBtn}
              />

              <TouchableOpacity
                style={styles.switchModeLink}
                onPress={() => handleSwitchMode('login')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchModeText}>
                  Já possui uma conta cadastrada?{' '}
                  <Text style={styles.switchModeHighlight}>Fazer Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Rodapé informativo */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            🔒 Banco de Dados Relacional SQLite • Armazenamento Local Seguro
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
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
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
  formSection: {},
  formHeader: {
    marginBottom: theme.spacing.md,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  formDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    marginTop: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputPrefixIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  actionBtn: {
    marginTop: theme.spacing.lg,
  },
  switchModeLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchModeText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  switchModeHighlight: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  quickFillContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  quickFillHeader: {
    marginBottom: theme.spacing.sm,
  },
  quickFillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickFillSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  accountsList: {
    gap: 8,
  },
  accountCard: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    padding: 10,
  },
  accountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  accountCardBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountCardEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
