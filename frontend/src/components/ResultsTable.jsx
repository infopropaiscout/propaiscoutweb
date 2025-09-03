import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  TableSortLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function PropertyROIDialog({ open, onClose, property }) {
  if (!property) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>ROI Analysis - {property.address}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Investment Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Purchase Price</Typography>
              <Typography variant="h6">{formatCurrency(property.price)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Estimated Repairs</Typography>
              <Typography variant="h6">{formatCurrency(property.estimated_repairs)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Potential ARV</Typography>
              <Typography variant="h6">{formatCurrency(property.arv)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function PropertyMessageDialog({ open, onClose, property }) {
  if (!property) return null;

  const [message, setMessage] = useState(
    `Hi,\n\nI noticed your property at ${property?.address} has been on the market for ${property?.days_on_market} days. ` +
    `I'm a local investor interested in making a quick, all-cash offer.\n\n` +
    `Would you be open to discussing a potential offer of ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(property?.price * 0.85)}?\n\n` +
    `Best regards,\n[Your name]`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Message - {property.address}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy} startIcon={<ContentCopyIcon />}>
          Copy Message
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function ResultsTable({ results = [], isLoading, onExport }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('motivation_score');
  const [order, setOrder] = useState('desc');
  
  // Dialog states
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleROIClick = (property) => {
    console.log('Opening ROI dialog for:', property);
    setSelectedProperty(property);
    setRoiDialogOpen(true);
  };

  const handleMessageClick = (property) => {
    console.log('Opening message dialog for:', property);
    setSelectedProperty(property);
    setMessageDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!results.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No properties found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {results.length} Properties Found
            </Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={onExport}
              variant="outlined"
            >
              Export Results
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'price'}
                      direction={orderBy === 'price' ? order : 'asc'}
                      onClick={() => handleSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'motivation_score'}
                      direction={orderBy === 'motivation_score' ? order : 'asc'}
                      onClick={() => handleSort('motivation_score')}
                    >
                      Motivation Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Days on Market</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{property.address}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {property.bedrooms} beds • {property.bathrooms} baths
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{formatCurrency(property.price)}</Typography>
                        {property.price_drop > 0 && (
                          <Typography variant="body2" color="error">
                            ↓ {formatCurrency(property.price_drop)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${property.motivation_score}%`}
                          color={property.motivation_score >= 80 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{property.days_on_market} days</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleROIClick(property)}
                            startIcon={<TrendingUpIcon />}
                          >
                            ROI
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleMessageClick(property)}
                            startIcon={<MessageIcon />}
                          >
                            Message
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PropertyROIDialog
        open={roiDialogOpen}
        onClose={() => setRoiDialogOpen(false)}
        property={selectedProperty}
      />

      <PropertyMessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        property={selectedProperty}
      />
    </Box>
  );
}

export default ResultsTable;