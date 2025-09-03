import React from 'react';
import { Typography, Grid, Paper, Button, Box } from '@mui/material';
import Modal from './Modal';

const ROIModal = ({ open, onClose, property }) => {
  if (!property) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const estimatedRepairs = property.estimated_repairs || 25000;
  const totalInvestment = property.price + estimatedRepairs;
  const arv = property.arv || (property.price * 1.3);
  const potentialProfit = arv - totalInvestment;
  const roi = (potentialProfit / totalInvestment) * 100;

  return (
    <Modal open={open} onClose={onClose}>
      <Box>
        <Typography variant="h5" gutterBottom>
          ROI Analysis
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {property.address}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ROIModal;
