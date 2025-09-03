import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
} from '@mui/material';

const ROIDialog = ({ open, onClose, property }) => {
  if (!property) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const estimatedRepairs = property.estimated_repairs || 25000;
  const totalInvestment = property.price + estimatedRepairs;
  const arv = property.arv || (property.price * 1.3);
  const potentialProfit = arv - totalInvestment;
  const roi = (potentialProfit / totalInvestment) * 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        ROI Analysis
        <Typography variant="subtitle2" color="text.secondary">
          {property.address}
        </Typography>
      </DialogTitle>
      <DialogContent>
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
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Market Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Days on Market
                  </Typography>
                  <Typography variant="h6">
                    {property.days_on_market} days
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Price per Sqft
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(property.price / (property.square_feet || 1500))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Motivation Score
                  </Typography>
                  <Typography variant="h6">
                    {property.motivation_score}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ROIDialog;
