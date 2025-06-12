import React, { createContext, useContext, useCallback, useState } from 'react';
import { darkTheme, lightTheme, Theme } from '@/constants/theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultValue: ThemeContextValue = {
  theme: darkTheme,
  toggleTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(darkTheme);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === darkTheme ? lightTheme : darkTheme));
  }, []);

  return (
    <ThemeContext.Provider value={React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
