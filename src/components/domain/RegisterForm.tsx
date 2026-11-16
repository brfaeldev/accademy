import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';

export interface RegisterFormPayload {
  name: string;
  email: string;
  course: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  isSubmitting: boolean;
  onRegister: (payload: RegisterFormPayload) => Promise<void>;
  onSwitchToLogin: () => void;
  onClearError: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  isSubmitting,
  onRegister,
  onSwitchToLogin,
  onClearError,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Criar Nova Conta</Text>
        <Text style={styles.formDesc}>
          Sua conta será salva no banco SQLite local com senha criptografada (SHA-256).
        </Text>
      </View>

      <FormField
        label="Nome Completo"
        required
        icon="👤"
        placeholder="Ex: Carlos Ferreira"
        value={name}
        onChangeText={(t) => {
          setName(t);
          onClearError();
        }}
        autoCapitalize="words"
      />

      <FormField
        label="E-mail"
        required
        icon="✉️"
        placeholder="Ex: carlos@fho.edu.br"
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
        label="Curso / Graduação (opcional)"
        icon="🎓"
        placeholder="Ex: Engenharia de Software"
        value={course}
        onChangeText={setCourse}
      />

      <FormField
        label="Senha"
        required
        icon="🔒"
        placeholder="Mínimo de 3 caracteres"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          onClearError();
        }}
        isPassword
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormField
        label="Confirmar Senha"
        required
        icon="🔒"
        placeholder="Repita a senha digitada"
        value={confirmPassword}
        onChangeText={(t) => {
          setConfirmPassword(t);
          onClearError();
        }}
        isPassword
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title={isSubmitting ? 'Criando Conta...' : 'Cadastrar e Acessar'}
        variant="primary"
        onPress={() =>
          onRegister({ name, email, course, password, confirmPassword })
        }
        loading={isSubmitting}
        style={styles.actionBtn}
      />

      <TouchableOpacity
        style={styles.switchModeLink}
        onPress={onSwitchToLogin}
        activeOpacity={0.7}
      >
        <Text style={styles.switchModeText}>
          Já possui uma conta cadastrada?{' '}
          <Text style={styles.switchModeHighlight}>Fazer Login</Text>
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
