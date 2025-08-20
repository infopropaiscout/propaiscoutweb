import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';
import { Snackbar, Alert, LinearProgress } from '@mui/material';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Modern blue
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#EC4899', // Modern pink
      light: '#F9A8D4',
      dark: '#BE185D',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Modern green
    },
    warning: {
      main: '#F59E0B', // Modern orange
    },
    error: {
      main: '#EF4444', // Modern red
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

  const handleSearch = async (filters) => {
    setIsLoading(true);
    try {
      // For development/testing, return mock data
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        const mockData = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          address: `${123 + i} Main St`,
          zip_code: filters.zip_codes[0],
          price: 300000 + (i * 50000),
          square_feet: 1500 + (i * 100),
          days_on_market: 30 + (i * 15),
          price_drops: i % 3,
          property_type: ['single-family', 'multi-family', 'condo'][i % 3],
          owner_status: i % 2 === 0 ? 'owner-occupied' : 'absentee',
          tax_assessed_value: 280000 + (i * 45000),
          listing_agent: 'John Doe',
          motivation_score: 50 + (i * 5),
          suggested_offer: 250000 + (i * 40000),
          estimated_roi: 15 + (i * 2),
          predicted_resale_price: 350000 + (i * 60000),
          pre_foreclosure: i % 5 === 0,
        }));
        setSearchResults(mockData);
        setNotification({
          open: true,
          message: `Found ${mockData.length} properties matching your criteria`,
          severity: 'success',
        });
      } else {
        const response = await fetch(`${API_URL}/api/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchResults(data);
        setNotification({
          open: true,
          message: `Found ${data.length} properties matching your criteria`,
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setNotification({
        open: true,
        message: 'Error fetching results. Please try again.',
        severity: 'error',
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock export in development
        const csvContent = 'data:text/csv;charset=utf-8,' + 
          'Address,Price,Motivation Score\n' +
          searchResults.map(row => 
            `${row.address},${row.price},${row.motivation_score}`
          ).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `propai-scout-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(`${API_URL}/api/export`, {
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
      }
      
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