import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';
import { Snackbar, Alert } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E3B55',
      light: '#4C5F8A',
      dark: '#1A2233',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF9B9B',
      dark: '#CC4B4B',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFA726',
    },
    error: {
      main: '#EF5350',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleSearch = async (filters) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.propaiscout.com/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setNotification({
        open: true,
        message: `Found ${data.length} properties matching your criteria`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error fetching results:', error);
      setNotification({
        open: true,
        message: 'Error fetching results. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('https://api.propaiscout.com/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: searchResults }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propai-scout-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setNotification({
        open: true,
        message: 'Export completed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({
        open: true,
        message: 'Error exporting data. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh', 
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Header />
          <Container 
            maxWidth="lg" 
            sx={{ 
              py: 4,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <SearchForm onSearch={handleSearch} />
            <ResultsTable 
              results={searchResults} 
              isLoading={isLoading} 
              onExport={handleExport}
            />
          </Container>
          <Snackbar 
            open={notification.open} 
            autoHideDuration={6000} 
            onClose={() => setNotification({ ...notification, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setNotification({ ...notification, open: false })} 
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;