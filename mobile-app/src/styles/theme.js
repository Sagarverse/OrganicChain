export const COLORS = {
  // Primary palette (modern blue/green theme matching web)
  primaryDark: '#0f1419',
  primaryMid: '#1a1f2e',
  primaryLight: '#252d3d',
  primaryLighter: '#2f3747',
  primaryLightest: '#10b981',

  // Background
  background: '#0f1419',
  backgroundGradientStart: '#0f1419',
  backgroundGradientEnd: '#1a2332',

  // Glass effect
  glassBackground: 'rgba(26, 31, 46, 0.3)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',

  // Status colors
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',

  // Authenticity score colors
  scoreExcellent: '#10b981',
  scoreGood: '#84cc16',
  scoreFair: '#f59e0b',
  scorePoor: '#ef4444',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 10,
    elevation: 12,
  },
};

export const GLASS_STYLES = {
  card: {
    backgroundColor: COLORS.glassBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  button: {
    backgroundColor: COLORS.primaryMid,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    ...SHADOWS.small,
  },
};
