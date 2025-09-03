import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';
import { Snackbar, Alert, LinearProgress, Typography, Paper } from '@mui/material';
import { propertyService } from './services/propertyService';
import { API_CONFIG } from './config/api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#EC4899',
      light: '#F9A8D4',
      dark: '#BE185D',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            },
            '&.Mui-focused': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
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
  const [apiStatus, setApiStatus] = useState({ checked: false, hasKey: false });

  useEffect(() => {
    // Check API configuration on mount
    const hasApiKey = !!API_CONFIG.RAPIDAPI_KEY;
    console.log('API Configuration Status:', {
      hasApiKey,
      useMockData: API_CONFIG.USE_MOCK_DATA,
      envVars: {
        hasRapidApiKey: !!process.env.REACT_APP_RAPIDAPI_KEY,
      }
    });
    setApiStatus({ checked: true, hasKey: hasApiKey });
  }, []);

  const handleSearch = async (filters) => {
    setIsLoading(true);
    try {
      console.log('Starting property search with filters:', filters);
      const data = await propertyService.searchProperties(filters);
      console.log('Search completed, found properties:', data.length);
      setSearchResults(data);
      showNotification(
        API_CONFIG.USE_MOCK_DATA
          ? `Found ${data.length} properties (using example data)`
          : `Found ${data.length} properties matching your criteria`,
        'success'
      );
    } catch (error) {
      console.error('Search error:', error);
      showNotification(
        error.message || 'Error fetching results. Please try again.',
        'error'
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const headers = ['Address', 'Price', 'Motivation Score', 'Days on Market', 'ROI'];
      const csvContent = [
        headers.join(','),
        ...searchResults.map(property => [
          property.address,
          property.price,
          property.motivation_score,
          property.days_on_market,
          property.estimated_roi
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `propai-scout-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Export completed successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification(
        error.message || 'Error exporting data. Please try again.',
        'error'
      );
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
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
          {isLoading && (
            <LinearProgress 
              sx={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                zIndex: 9999,
              }} 
            />
          )}
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
            {apiStatus.checked && !apiStatus.hasKey && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'warning.light',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography variant="body1" color="warning.dark">
                  ⚠️ Running in demo mode with example data. To see real property data, please configure the RapidAPI key in the environment variables.
                </Typography>
              </Paper>
            )}
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
              variant="filled"
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