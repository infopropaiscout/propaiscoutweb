import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';
import ROIModal from './components/ROIModal';
import MessageModal from './components/MessageModal';
import { Snackbar, Alert, LinearProgress } from '@mui/material';
import { propertyService } from './services/propertyService';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
    },
    background: {
      default: '#F8FAFC',
    },
  },
});

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [roiModalOpen, setRoiModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSearch = async (filters) => {
    setIsLoading(true);
    try {
      const data = await propertyService.searchProperties(filters);
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
      showNotification(error.message || 'Error exporting data. Please try again.', 'error');
    }
  };

  const handleROIClick = (property) => {
    console.log('Opening ROI modal for:', property);
    setSelectedProperty(property);
    setRoiModalOpen(true);
  };

  const handleMessageClick = (property) => {
    console.log('Opening message modal for:', property);
    setSelectedProperty(property);
    setOutreachMessage(generateMessage(property));
    setMessageModalOpen(true);
  };

  const handleMessageChange = (e) => {
    setOutreachMessage(e.target.value);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(outreachMessage)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy message', 'error');
      });
  };

  const generateMessage = (property) => {
    return `Hi,

I noticed your property at ${property.address} has been on the market for ${property.days_on_market} days${property.price_drop ? ' and recently had a price reduction' : ''}.

I'm a local investor specializing in quick, hassle-free transactions, and I may be able to offer you a faster exit. Based on my analysis:

- Current asking price: ${formatCurrency(property.price)}
- Quick offer suggestion: ${formatCurrency(property.price * 0.85)}
- Closing timeline: As quick as 14 days

Key Benefits of Working with Me:
- No real estate commissions
- No repairs or renovations needed
- Flexible closing timeline
- All cash offer
- Quick and simple process

Would you be open to a conversation about your property? I can be flexible with the closing timeline and terms to meet your needs.

Best regards,
[Your name]

P.S. I'm ready to move forward quickly if this opportunity interests you.`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  return (
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
            onROIClick={handleROIClick}
            onMessageClick={handleMessageClick}
          />
        </Container>

        <ROIModal
          open={roiModalOpen}
          onClose={() => setRoiModalOpen(false)}
          property={selectedProperty}
        />

        <MessageModal
          open={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          property={selectedProperty}
          message={outreachMessage}
          onMessageChange={handleMessageChange}
          onCopy={handleCopyMessage}
        />

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

        <Snackbar
          open={copySuccess}
          autoHideDuration={3000}
          onClose={() => setCopySuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            Message copied to clipboard!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;