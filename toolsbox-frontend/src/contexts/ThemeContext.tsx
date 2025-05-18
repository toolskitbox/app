import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  theme: ReturnType<typeof createTheme>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({  
  mode: 'light',
  theme: createTheme(),
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#3f51b5',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 500,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
                  : '0px 4px 20px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0px 2px 10px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 10px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
