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
import apiService from './services/api';

// Import theme configuration (previous theme configuration remains the same)
const theme = createTheme({
  // ... (keep your existing theme configuration)
});

const queryClient = new QueryClient();

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleSearch = async (filters) => {
    setIsLoading(true);
    try {
      const data = await apiService.searchProperties(filters);
      setSearchResults(data);
      showNotification(`Found ${data.length} properties matching your criteria`, 'success');
    } catch (error) {
      console.error('Search error:', error);
      showNotification(error.message || 'Error fetching results. Please try again.', 'error');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportToCSV(searchResults);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propai-scout-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('Export completed successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification(error.message || 'Error exporting data. Please try again.', 'error');
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