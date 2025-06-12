export interface Theme {
  colors: {
    background: string;
    surface: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    muted: string;
    success: string;
    danger: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSizes: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fonts: {
    regular: string;
    mono: string;
  };
}

const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const baseFontSizes = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
};

const fonts = {
  regular: 'System',
  mono: 'monospace',
};

const lightColors = {
  background: '#ffffff',
  surface: '#f3f4f6',
  text: '#111827',
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  border: '#e5e7eb',
  muted: '#6b7280',
  success: '#10B981',
  danger: '#EF4444',
};

const darkColors = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  text: '#ffffff',
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  border: '#2a2a2a',
  muted: '#6b7280',
  success: '#10B981',
  danger: '#EF4444',
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing: baseSpacing,
  fontSizes: baseFontSizes,
  fonts,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing: baseSpacing,
  fontSizes: baseFontSizes,
  fonts,
};
