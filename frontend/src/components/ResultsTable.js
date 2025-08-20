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
import apiService from '../services/api';

function ResultsTable({ results, isLoading, onExport }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('outreach');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateOutreach = async (property) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await apiService.generateOutreachMessage(property.id);
      setSelectedProperty({ ...property, outreachMessage: data.message });
      setDialogType('outreach');
      setDialogOpen(true);
    } catch (error) {
      setError(error.message);
      console.error('Error generating outreach message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (keep the rest of your existing code, including all the columns configuration)

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
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : isGenerating ? (
            <Typography>Generating message...</Typography>
          ) : dialogType === 'outreach' ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', p: 2 }}>
              {selectedProperty?.outreachMessage}
            </Typography>
          ) : (
            selectedProperty && <ROIDialog property={selectedProperty} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {dialogType === 'outreach' && !error && !isGenerating && (
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