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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';

function ResultsTable({ results, isLoading, onExport }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outreachMessage, setOutreachMessage] = useState('');

  const handleGenerateOutreach = async (propertyId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/property/${propertyId}/outreach`);
      const data = await response.json();
      setOutreachMessage(data.message);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error generating outreach message:', error);
    }
  };

  const columns = [
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'zip_code', headerName: 'ZIP', width: 100 },
    {
      field: 'motivation_score',
      headerName: 'Motivation Score',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{params.value.toFixed(1)}</Typography>
          <Box
            sx={{
              width: 50,
              height: 24,
              borderRadius: 1,
              backgroundColor: params.value >= 70 ? '#4caf50' : params.value >= 40 ? '#ff9800' : '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              ml: 1,
            }}
          >
            {params.value >= 70 ? 'High' : params.value >= 40 ? 'Med' : 'Low'}
          </Box>
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'List Price',
      width: 130,
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
    },
    {
      field: 'suggested_offer',
      headerName: 'Suggested Offer',
      width: 130,
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
    },
    {
      field: 'estimated_roi',
      headerName: 'Est. ROI',
      width: 100,
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
    },
    {
      field: 'days_on_market',
      headerName: 'Days Listed',
      width: 110,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          startIcon={<EmailIcon />}
          size="small"
          onClick={() => handleGenerateOutreach(params.row.id)}
        >
          Contact
        </Button>
      ),
    },
  ];

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
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              loading={isLoading}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem',
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
        <DialogTitle>Outreach Message</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {outreachMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(outreachMessage);
            }}
          >
            Copy Message
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ResultsTable;