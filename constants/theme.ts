export const Colors = {
  primary: '#FF5C33',
  accent: '#FFC233',
  success: '#3DBE29',
  error: '#DC3545',
  warning: '#FFA500',
  info: '#17A2B8',
  background: '#F9F9F9',
  neutral: '#EDEDED',
  text: '#1E1E1E',
  muted: '#6C757D',
  warmAccent: '#5A3E2B',
  white: '#FFFFFF',
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    accent: '#FF5C33',
    muted: '#A1A1A1',
  },
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subheadline: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  round: 999,
};
