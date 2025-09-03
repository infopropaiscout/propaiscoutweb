import React from 'react';
import { Typography, Grid, Paper, Button, Box, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Modal from './Modal';

const MessageModal = ({ open, onClose, property, message, onMessageChange, onCopy }) => {
  if (!property) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Generate Outreach Message
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {property.address}
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: 'grey.50',
            borderRadius: 2,
            mt: 2,
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={onCopy}
            variant="contained"
            color="primary"
          >
            Copy Message
          </Button>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MessageModal;
