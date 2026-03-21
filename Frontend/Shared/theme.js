import { Platform } from 'react-native';

export const colors = {
  background: '#F3F6FB',
  surface: '#FFFFFF',
  surfaceSoft: '#E8EEF7',
  border: '#C8D3E0',
  text: '#0E2742',
  muted: '#5E738B',
  primary: '#0C4DA2',
  accent: '#F57F17',
  accentSoft: '#FFF3E0',
  success: '#1B8D4E',
  danger: '#C62828',
  warning: '#C79B18',
};

export const radius = {
  sm: 0,
  md: 0,
  lg: 0,
  pill: 0,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadow = {
  ...(Platform.OS === 'web'
    ? {}
    : {
        shadowColor: 'transparent',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      }),
};