/**
 * Componente FormField (Campo de Formulário Padronizado)
 *
 * Encapsula rótulo (label), indicação de campo obrigatório (*), ícone de prefixo,
 * controle de alternância de visualização de senha e mensagens de erro de validação.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

export interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  icon?: string;
  error?: string | null;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  icon,
  error,
  isPassword = false,
  showPassword,
  onTogglePassword,
  containerStyle,
  multiline,
  style,
  ...rest
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const isPasswordVisible =
    showPassword !== undefined ? showPassword : internalShowPassword;

  const handleToggle = () => {
    if (onTogglePassword) {
      onTogglePassword();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error ? styles.inputError : null,
        ]}
      >
        {icon ? <Text style={styles.prefixIcon}>{icon}</Text> : null}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isPassword ? !isPasswordVisible : rest.secureTextEntry}
          multiline={multiline}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  requiredMark: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
    minHeight: 76,
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
  },
  prefixIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingVertical: 8,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.dangerText,
    marginTop: 4,
    fontWeight: '500',
  },
});
