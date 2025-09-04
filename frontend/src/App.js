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
} from '@mui/material';
import ROIDialog from './components/dialogs/ROIDialog';
import OutreachDialog from './components/dialogs/OutreachDialog';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
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
  
  // Dialog states
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Searching with filters:', filters);
      const fetchedProperties = await propertyService.searchProperties(filters);
      setProperties(fetchedProperties);
      console.log('Properties set:', fetchedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
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

  const handleROIClick = (property) => {
    console.log('ROI button clicked for:', property);
    setSelectedProperty(property);
    setRoiDialogOpen(true);
  };

  const handleMessageClick = (property) => {
    console.log('Message button clicked for:', property);
    setSelectedProperty(property);
    setMessageDialogOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              onROIClick={handleROIClick}
              onMessageClick={handleMessageClick}
            />
          )}
        </Box>

        <ROIDialog
          open={roiDialogOpen}
          onClose={() => setRoiDialogOpen(false)}
          property={selectedProperty}
        />

        <OutreachDialog
          open={messageDialogOpen}
          onClose={() => setMessageDialogOpen(false)}
          property={selectedProperty}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;