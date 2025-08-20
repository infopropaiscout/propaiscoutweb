import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';

function ResultsTable({ results, isLoading, onExport }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('outreach');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleGenerateOutreach = async (property) => {
    try {
      const response = await fetch(`https://api.propaiscout.com/api/property/${property.id}/outreach`);
      const data = await response.json();
      setSelectedProperty({ ...property, outreachMessage: data.message });
      setDialogType('outreach');
      setDialogOpen(true);
    } catch (error) {
      console.error('Error generating outreach message:', error);
    }
  };

  const handleShowROI = (property) => {
    setSelectedProperty(property);
    setDialogType('roi');
    setDialogOpen(true);
  };

  const getMotivationScoreColor = (score) => {
    if (score >= 70) return '#4caf50';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const getMotivationFactors = (property) => {
    const factors = [];
    if (property.days_on_market > 90) factors.push('Long DOM');
    if (property.price_drops > 0) factors.push('Price Drops');
    if (property.price < property.tax_assessed_value) factors.push('Below TAV');
    if (property.owner_status === 'absentee') factors.push('Absentee');
    if (property.pre_foreclosure) factors.push('Pre-FC');
    return factors;
  };

  const columns = [
    {
      field: 'address',
      headerName: 'Property Details',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.address}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.zip_code} • {params.row.property_type}
            {params.row.owner_status === 'absentee' && (
              <Tooltip title="Absentee Owner">
                <BusinessIcon fontSize="small" sx={{ ml: 1, color: 'warning.main' }} />
              </Tooltip>
            )}
            {params.row.pre_foreclosure && (
              <Tooltip title="Pre-Foreclosure">
                <WarningIcon fontSize="small" sx={{ ml: 1, color: 'error.main' }} />
              </Tooltip>
            )}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'motivation_score',
      headerName: 'Motivation',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 500, color: getMotivationScoreColor(params.value) }}>
              {params.value.toFixed(0)}
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.5 }}>/100</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {getMotivationFactors(params.row).map((factor) => (
              <Chip
                key={factor}
                label={factor}
                size="small"
                variant="outlined"
                sx={{ height: 20 }}
              />
            ))}
          </Box>
        </Box>
      ),
      sortable: true,
    },
    {
      field: 'price',
      headerName: 'Price Info',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ${params.value.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
            {params.row.price_drops > 0 ? (
              <>
                <TrendingDownIcon fontSize="small" color="error" />
                {params.row.price_drops}x dropped
              </>
            ) : 'No price changes'}
          </Typography>
        </Box>
      ),
      sortable: true,
    },
    {
      field: 'suggested_offer',
      headerName: 'Deal Analysis',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            Offer: ${params.value.toLocaleString()}
          </Typography>
          <Typography
            variant="caption"
            sx={{ 
              color: params.row.estimated_roi >= 15 ? 'success.main' : 'warning.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
            ROI: {params.row.estimated_roi.toFixed(1)}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'days_on_market',
      headerName: 'DOM',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value} days`}
          color={params.value > 90 ? 'error' : params.value > 60 ? 'warning' : 'default'}
          size="small"
        />
      ),
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<EmailIcon />}
            size="small"
            variant="outlined"
            onClick={() => handleGenerateOutreach(params.row)}
          >
            Contact
          </Button>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleShowROI(params.row)}
          >
            <TrendingUpIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const ROIDialog = ({ property }) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>ROI Analysis</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">Purchase Price</Typography>
          <Typography variant="h6">${property.suggested_offer.toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">Est. Repairs</Typography>
          <Typography variant="h6">${(property.square_feet * 20).toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">ARV</Typography>
          <Typography variant="h6">${property.predicted_resale_price.toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">Potential Profit</Typography>
          <Typography variant="h6" color="success.main">
            ${(property.predicted_resale_price - property.suggested_offer - (property.square_feet * 20)).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Search Results</Typography>
            {results.length > 0 && (
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                onClick={onExport}
              >
                Export to CSV
              </Button>
            )}
          </Box>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={results}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              loading={isLoading}
              sortingMode="server"
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'outreach' ? 'Outreach Message' : 'ROI Analysis'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'outreach' ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', p: 2 }}>
              {selectedProperty?.outreachMessage}
            </Typography>
          ) : (
            selectedProperty && <ROIDialog property={selectedProperty} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {dialogType === 'outreach' && (
            <Button
              variant="contained"
              onClick={() => {
                navigator.clipboard.writeText(selectedProperty.outreachMessage);
              }}
            >
              Copy Message
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ResultsTable;