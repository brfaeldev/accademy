import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../../types';
import { theme } from '../../theme/theme';

interface SavedAccountsListProps {
  accounts: User[];
  onSelectEmail: (email: string) => void;
}

export const SavedAccountsList: React.FC<SavedAccountsListProps> = ({
  accounts,
  onSelectEmail,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Nenhuma conta cadastrada neste dispositivo ainda. Crie sua conta na aba &quot;Criar Conta&quot;.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>
          🗄️ Contas salvas neste dispositivo ({accounts.length})
        </Text>
        <Text style={styles.toggleAction}>
          {expanded ? 'Ocultar ▲' : 'Mostrar ▼'}
        </Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.accountsList}>
          <Text style={styles.subtitle}>
            Toque em uma conta para preencher o e-mail rapidamente:
          </Text>
          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={styles.accountCard}
              onPress={() => onSelectEmail(acc.email)}
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
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  toggleAction: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  accountsList: {
    marginTop: 8,
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
});
