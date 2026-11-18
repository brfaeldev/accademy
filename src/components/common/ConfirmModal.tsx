/**
 * Componente ConfirmModal (Modal de Confirmação)
 *
 * Diálogo modal para confirmação de ações irreversíveis ou de impacto,
 * como exclusão de matérias, tarefas ou notas, com suporte a variantes
 * de alerta ('danger' e 'primary').
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ModalWrapper } from './ModalWrapper';
import { Button } from './Button';
import { theme } from '../../theme/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <ModalWrapper visible={visible} onClose={onCancel} title={title}>
      <View style={styles.messageBox}>
        <Text style={styles.icon}>{variant === 'danger' ? '⚠️' : 'ℹ️'}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title={cancelLabel}
          variant="outline"
          onPress={onCancel}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title={confirmLabel}
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onPress={onConfirm}
          style={{ flex: 1 }}
        />
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
});
