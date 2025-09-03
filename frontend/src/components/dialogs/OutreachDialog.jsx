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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const OutreachDialog = ({ open, onClose, property }) => {
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (open && property) {
      const generatedMessage = `Hi,

I noticed your property at ${property.address} has been on the market for ${property.days_on_market} days${property.price_drop ? ' and recently had a price reduction' : ''}.

I'm a local investor specializing in quick, hassle-free transactions, and I may be able to offer you a faster exit. Based on my analysis:

- Current asking price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
- Quick offer suggestion: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price * 0.85)}
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

      setMessage(generatedMessage);
    }
  }, [open, property]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  if (!property) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate Outreach Message
          <Typography variant="subtitle2" color="text.secondary">
            {property.address}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Property Details:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    Days on Market: {property.days_on_market}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    Motivation Score: {property.motivation_score}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <TextField
              fullWidth
              multiline
              rows={12}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              variant="contained"
              color="primary"
            >
              Copy Message
            </Button>
          </Box>
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
        <Alert onClose={() => setCopySuccess(false)} severity="success" variant="filled">
          Message copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default OutreachDialog;
