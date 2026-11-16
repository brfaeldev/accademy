import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../../types';
import { theme } from '../../theme/theme';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { SavedAccountsList } from './SavedAccountsList';

interface LoginFormProps {
  availableAccounts: User[];
  isSubmitting: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  onQuickFillNotice: (message: string) => void;
  onClearError: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  availableAccounts,
  isSubmitting,
  onLogin,
  onSwitchToRegister,
  onQuickFillNotice,
  onClearError,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickFill = (selectedEmail: string) => {
    setEmail(selectedEmail);
    onClearError();
    onQuickFillNotice(`E-mail ${selectedEmail} preenchido. Digite sua senha para entrar.`);
  };

  return (
    <View>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Acessar Conta</Text>
        <Text style={styles.formDesc}>
          Entre com seu e-mail e senha cadastrados no banco SQLite local.
        </Text>
      </View>

      <FormField
        label="E-mail de Cadastro"
        icon="✉️"
        placeholder="ex: bruno@academy.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          onClearError();
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />

      <FormField
        label="Senha de Acesso"
        icon="🔒"
        placeholder="Sua senha"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          onClearError();
        }}
        isPassword
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title={isSubmitting ? 'Verificando no Banco...' : 'Entrar no Sistema'}
        variant="primary"
        onPress={() => onLogin(email, password)}
        loading={isSubmitting}
        style={styles.actionBtn}
      />

      <SavedAccountsList
        accounts={availableAccounts}
        onSelectEmail={handleQuickFill}
      />

      <TouchableOpacity
        style={styles.switchModeLink}
        onPress={onSwitchToRegister}
        activeOpacity={0.7}
      >
        <Text style={styles.switchModeText}>
          Ainda não tem conta?{' '}
          <Text style={styles.switchModeHighlight}>Cadastre-se aqui</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formHeader: {
    marginBottom: theme.spacing.sm,
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
});
