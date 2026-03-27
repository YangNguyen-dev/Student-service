import { createTheme } from '@mui/material/styles';

const lightPalette = {
  mode: 'light',
  primary: { main: '#6C63FF', light: '#9D97FF', dark: '#4A42CC' },
  secondary: { main: '#FF6584', light: '#FF8FA3', dark: '#CC5069' },
  background: { default: '#F0F2F5', paper: '#FFFFFF' },
  text: { primary: '#1A1A2E', secondary: '#6B7280' },
  error: { main: '#EF4444' },
  success: { main: '#10B981' },
  info: { main: '#06B6D4' },
  warning: { main: '#F59E0B' },
  divider: 'rgba(0, 0, 0, 0.06)',
};

const darkPalette = {
  mode: 'dark',
  primary: { main: '#8B83FF', light: '#B0ABFF', dark: '#6C63FF' },
  secondary: { main: '#FF8FA3', light: '#FFB3C1', dark: '#FF6584' },
  background: { default: '#0F1117', paper: '#1A1D2E' },
  text: { primary: '#E8EAED', secondary: '#9AA0B4' },
  error: { main: '#FF5252' },
  success: { main: '#4CAF50' },
  info: { main: '#29B6F6' },
  warning: { main: '#FFC107' },
  divider: 'rgba(255, 255, 255, 0.06)',
};

const getComponents = (mode) => {
  const isDark = mode === 'dark';
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: isDark
            ? 'linear-gradient(135deg, #8B83FF 0%, #6C63FF 100%)'
            : 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
          boxShadow: isDark
            ? '0 4px 15px rgba(139, 131, 255, 0.3)'
            : '0 4px 15px rgba(108, 99, 255, 0.3)',
          color: '#fff',
          '&:hover': {
            background: isDark
              ? 'linear-gradient(135deg, #9D97FF 0%, #8B83FF 100%)'
              : 'linear-gradient(135deg, #5A52E0 0%, #7B73FF 100%)',
            boxShadow: isDark
              ? '0 6px 25px rgba(139, 131, 255, 0.4)'
              : '0 6px 25px rgba(108, 99, 255, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFC',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5F6F8',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(139, 131, 255, 0.5)' : 'rgba(108, 99, 255, 0.4)',
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#8B83FF' : '#6C63FF',
              borderWidth: 2,
              boxShadow: isDark
                ? '0 0 0 3px rgba(139, 131, 255, 0.15)'
                : '0 0 0 3px rgba(108, 99, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: isDark ? '#1A1D2E' : '#FFFFFF',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: isDark
            ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFC',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.06)',
        },
        head: {
          color: isDark ? '#9AA0B4' : '#6B7280',
          fontWeight: 600,
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(139, 131, 255, 0.06) !important'
              : 'rgba(108, 99, 255, 0.03) !important',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: isDark ? '#1A1D2E' : '#FFFFFF',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? '#2A2D3E' : '#1A1A2E',
          borderRadius: 8,
          fontSize: '0.8rem',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: isDark ? '#9AA0B4' : '#6B7280',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
  };
};

export function getTheme(mode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return createTheme({
    palette,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
    components: getComponents(mode),
  });
}

export default getTheme('light');
