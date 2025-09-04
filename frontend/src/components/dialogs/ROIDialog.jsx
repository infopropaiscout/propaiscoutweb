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
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { propertyService } from '../../services/propertyService';

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value) => {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(2)}%`;
};

const ROIDialog = ({ open, onClose, property }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && property) {
      loadAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [open, property]);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await propertyService.analyzeROI(property);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing ROI:', err);
      setError('Failed to analyze property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        ROI Analysis
        <Typography variant="subtitle2" color="text.secondary">
          {property.address}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : analysis ? (
          <Stack spacing={3}>
            {/* Investment Summary */}
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
                    {formatCurrency(analysis.purchasePrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Repairs
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(analysis.estimatedRepairs)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    After Repair Value
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(analysis.afterRepairValue)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Monthly Cash Flow */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Monthly Cash Flow
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rental Income
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(analysis.rentalIncome)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expenses
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(analysis.expenses)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Net Cash Flow
                  </Typography>
                  <Typography variant="h6" color={analysis.cashflow >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(analysis.cashflow)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Return Metrics */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Return Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cap Rate
                  </Typography>
                  <Typography variant="h6">
                    {formatPercentage(analysis.capRate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ROI
                  </Typography>
                  <Typography variant="h6">
                    {formatPercentage(analysis.roi)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Analysis Summary */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Analysis Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {analysis.summary}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Typography variant="body1">
                {analysis.recommendations}
              </Typography>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!loading && !error && analysis && (
          <Button 
            onClick={loadAnalysis} 
            variant="outlined"
          >
            Refresh Analysis
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ROIDialog;