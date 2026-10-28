export const theme = {
  colors: {
    primary: '#4F46E5', // Indigo vibrante
    primaryDark: '#3730A3',
    primaryLight: '#EEF2FF',
    secondary: '#8B5CF6', // Purple
    secondaryLight: '#F5F3FF',

    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceBorder: '#E2E8F0',

    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    textOnPrimary: '#FFFFFF',

    success: '#10B981', // Emerald 500
    successLight: '#ECFDF5',
    successText: '#047857',

    warning: '#F59E0B', // Amber 500
    warningLight: '#FFFBEB',
    warningText: '#B45309',

    danger: '#EF4444', // Red 500
    dangerLight: '#FEF2F2',
    dangerText: '#B91C1C',

    info: '#0284C7', // Sky 600
    infoLight: '#F0F9FF',
    infoText: '#0369A1',

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
