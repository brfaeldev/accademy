/**
 * Design Tokens e Tema Global (theme.ts)
 *
 * Centraliza a paleta de cores, tipografia, espaçamentos, raios de borda
 * e sombras padronizadas do sistema de design da aplicação.
 */

export const theme = {
  colors: {
    primary: '#4F46E5', // Índigo vibrante
    primaryDark: '#3730A3',
    primaryLight: '#EEF2FF',
    secondary: '#8B5CF6', // Roxo
    secondaryLight: '#F5F3FF',

    background: '#F8FAFC', // Cinza claro de fundo (Slate 50)
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceBorder: '#E2E8F0',

    textPrimary: '#0F172A', // Texto principal (Slate 900)
    textSecondary: '#475569', // Texto secundário (Slate 600)
    textMuted: '#94A3B8', // Texto atenuado (Slate 400)

    success: '#10B981', // Verde esmeralda (Sucesso)
    successLight: '#ECFDF5',
    successText: '#047857',

    warning: '#F59E0B', // Âmbar / Amarelo (Atenção)
    warningLight: '#FFFBEB',
    warningText: '#B45309',

    danger: '#EF4444', // Vermelho (Erro / Perigo)
    dangerLight: '#FEF2F2',
    dangerText: '#B91C1C',

    // Cores para tags de matérias
    subjectBadges: [
      { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
      { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
      { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
      { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
      { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
      { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
    ]
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    hover: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    }
  }
};
