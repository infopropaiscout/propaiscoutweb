import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  TextField
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const SimpleDialog = ({ 
  open, 
  onClose, 
  title, 
  property, 
  type, // 'roi' or 'message'
  message,
  onMessageChange,
  onCopy 
}) => {
  if (!property) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {title}
        <Typography variant="subtitle2" color="text.secondary">
          {property.address}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {type === 'roi' ? (
          // ROI Content
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Investment Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Purchase Price
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(property.price)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Repairs
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(property.estimated_repairs || 25000)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Investment
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(property.price + (property.estimated_repairs || 25000))}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // Message Content
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
                    Price: {formatCurrency(property.price)}
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
              onChange={onMessageChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={onCopy}
              variant="contained"
              color="primary"
            >
              Copy Message
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleDialog;
