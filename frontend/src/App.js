import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  CssBaseline,
  createTheme,
  ThemeProvider,
  Divider
} from '@mui/material';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import TestDialog from './components/TestDialog';
import { propertyService } from './services/propertyService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Searching with filters:', filters);
      // For now, let's use mock data to ensure the UI works
      const mockData = [
        {
          id: 1,
          address: '123 Main St, Newark, NJ',
          price: 350000,
          price_drop: 25000,
          days_on_market: 95,
          motivation_score: 85,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1800,
          score_factors: ['Price reduced recently', 'Long time on market'],
          estimated_repairs: 25000,
          arv: 450000,
          url: 'https://example.com/property/1'
        },
        {
          id: 2,
          address: '456 Oak Ave, Jersey City, NJ',
          price: 425000,
          price_drop: 0,
          days_on_market: 45,
          motivation_score: 65,
          bedrooms: 4,
          bathrooms: 2.5,
          square_feet: 2200,
          score_factors: ['Absentee owner'],
          estimated_repairs: 35000,
          arv: 550000,
          url: 'https://example.com/property/2'
        }
      ];
      
      setProperties(mockData);
      console.log('Properties set:', mockData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Convert properties to CSV and download
    const headers = ['Address', 'Price', 'Days on Market', 'Motivation Score'];
    const csvContent = properties.map(p => 
      [p.address, p.price, p.days_on_market, p.motivation_score].join(',')
    );
    
    const csv = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Test Dialog Section */}
        <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Dialog Test Section
          </Typography>
          <Typography variant="body2" gutterBottom color="text.secondary">
            This section tests basic dialog functionality
          </Typography>
          <TestDialog />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Main App Section */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            PropAI Scout
          </Typography>
          
          <SearchForm onSearch={handleSearch} loading={loading} />
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && (
            <ResultsTable 
              results={properties}
              isLoading={loading}
              onExport={handleExport}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;