import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Stack
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export const ROIButton = ({ property }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    console.log('ROI button clicked for property:', property);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const estimatedRepairs = property.estimated_repairs || 25000;
  const totalInvestment = property.price + estimatedRepairs;
  const arv = property.arv || (property.price * 1.3);
  const potentialProfit = arv - totalInvestment;
  const roi = (potentialProfit / totalInvestment) * 100;

  return (
    <>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={handleClick}
        startIcon={<TrendingUpIcon />}
      >
        ROI
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          ROI Analysis
          <Typography variant="subtitle2" color="text.secondary">
            {property.address}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
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
                      {formatCurrency(estimatedRepairs)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Investment
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totalInvestment)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Potential Returns
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      After Repair Value (ARV)
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(arv)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Potential Profit
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(potentialProfit)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ROI
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {roi.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const MessageButton = ({ property }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = () => {
    console.log('Message button clicked for property:', property);
    setMessage(generateMessage(property));
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
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

  return (
    <>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={handleClick}
        startIcon={<MessageIcon />}
      >
        Message
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ActionButtons = ({ property }) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <ROIButton property={property} />
      <MessageButton property={property} />
    </Stack>
  );
};
