import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme/theme';

const ThemeContext = createContext();

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Update body classes for CSS-level theming
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    // Add transition class for smooth color change
    document.body.classList.add('theme-transitioning');
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 500);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
