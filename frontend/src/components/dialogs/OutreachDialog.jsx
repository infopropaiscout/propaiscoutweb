import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { propertyService } from '../../services/propertyService';

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const OutreachDialog = ({ open, onClose, property }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (open && property) {
      generateMessage();
    } else {
      setMessage('');
      setError(null);
    }
  }, [open, property]);

  const generateMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedMessage = await propertyService.generateOutreachMessage(property);
      setMessage(generatedMessage);
    } catch (err) {
      console.error('Error generating message:', err);
      setError('Failed to generate message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy message:', err);
      setError('Failed to copy message to clipboard');
    }
  };

  if (!property) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Generate Outreach Message
          <Typography variant="subtitle2" color="text.secondary">
            {property.address}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Property Details */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Property Details:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Price: {formatCurrency(property.price)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Days on Market: {property.days_on_market || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Motivation Score: {property.motivation_score || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Beds: {property.beds || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Baths: {property.baths || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Sqft: {property.sqft || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Message Area */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={generateMessage}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  placeholder="Generated message will appear here..."
                />

                <Stack 
                  direction="row" 
                  spacing={1} 
                  justifyContent="flex-start"
                  sx={{ mt: 2 }}
                >
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      onClick={handleCopy}
                      disabled={!message}
                      color="primary"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Generate new message">
                    <IconButton
                      onClick={generateMessage}
                      color="primary"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Message copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default OutreachDialog;