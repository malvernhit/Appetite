import { useApp } from '@/context/AppContext';
import { Colors } from '@/constants/theme';

export function useThemedColors() {
  const { theme } = useApp();

  if (theme === 'dark') {
    return {
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      muted: Colors.dark.muted,
      primary: Colors.primary,
      accent: Colors.accent,
      success: Colors.success,
      neutral: '#2A2A2A',
      white: Colors.dark.card,
      border: '#333333',
    };
  }

  return {
    background: Colors.background,
    card: Colors.white,
    text: Colors.text,
    muted: Colors.dark.muted,
    primary: Colors.primary,
    accent: Colors.accent,
    success: Colors.success,
    neutral: Colors.neutral,
    white: Colors.white,
    border: Colors.neutral,
  };
}
