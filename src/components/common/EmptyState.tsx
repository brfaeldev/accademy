/**
 * Componente EmptyState (Estado Vazio)
 *
 * Apresentado quando uma lista ou visualização não possui itens a exibir
 * (como ausência de matérias, tarefas ou sessões), trazendo ícone ilustrativo,
 * título, descrição explicativa e botão de ação para cadastro rápido.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { theme } from '../../theme/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📂',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="primary"
          size="sm"
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    marginTop: 16,
  },
});
