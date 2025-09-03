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

const ResultsTable = ({ results = [], isLoading, onExport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('motivation_score');
  const [order, setOrder] = useState('desc');
  
  // Dialog states
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleROIClick = (property) => {
    console.log('ROI Click:', property);
    setSelectedProperty(property);
    setRoiDialogOpen(true);
  };

  const handleMessageClick = (property) => {
    console.log('Message Click:', property);
    setSelectedProperty(property);
    generateMessage(property);
    setMessageDialogOpen(true);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(outreachMessage);
  };

  const generateMessage = (property) => {
    const message = `Hi,

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

    setOutreachMessage(message);
  };

  const sortedResults = React.useMemo(() => {
    if (!Array.isArray(results)) {
      console.error('Results is not an array:', results);
      return [];
    }
    
    const comparator = (a, b) => {
      if (!a || !b) return 0;
      if (order === 'desc') {
        return (b[orderBy] || 0) - (a[orderBy] || 0);
      }
      return (a[orderBy] || 0) - (b[orderBy] || 0);
    };
    return [...results].sort(comparator);
  }, [results, order, orderBy]);

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

  if (isLoading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Searching for properties...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Properties Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or exploring different zip codes.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {results.length} Properties Found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onExport}
              sx={{ borderRadius: 2 }}
            >
              Export Results
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property Details</TableCell>
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'days_on_market'}
                      direction={orderBy === 'days_on_market' ? order : 'asc'}
                      onClick={() => handleSort('days_on_market')}
                    >
                      Days on Market
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {property.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {property.bedrooms} beds • {property.bathrooms} baths • {property.square_feet} sqft
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatCurrency(property.price)}
                        </Typography>
                        {property.price_drop > 0 && (
                          <Typography variant="body2" color="error">
                            ↓ {formatCurrency(property.price_drop)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${property.motivation_score}%`}
                          color={property.motivation_score >= 80 ? 'success' : property.motivation_score >= 60 ? 'warning' : 'error'}
                          size="small"
                        />
                        {property.score_factors && property.score_factors.length > 0 && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            {property.score_factors[0]}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {property.days_on_market} days
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
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
                          <Tooltip title="View Property">
                            <IconButton
                              size="small"
                              onClick={() => window.open(property.url, '_blank')}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* ROI Dialog */}
      <Dialog 
        open={roiDialogOpen} 
        onClose={() => setRoiDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ROI Analysis
          {selectedProperty && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedProperty.address}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
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
                        {formatCurrency(selectedProperty.price)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estimated Repairs
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedProperty.estimated_repairs)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Investment
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedProperty.price + selectedProperty.estimated_repairs)}
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
                        {formatCurrency(selectedProperty.arv)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Potential Profit
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(selectedProperty.arv - (selectedProperty.price + selectedProperty.estimated_repairs))}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ROI
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {(((selectedProperty.arv - (selectedProperty.price + selectedProperty.estimated_repairs)) / 
                          (selectedProperty.price + selectedProperty.estimated_repairs)) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoiDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generate Outreach Message
          {selectedProperty && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedProperty.address}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
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
                      Price: {formatCurrency(selectedProperty.price)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Days on Market: {selectedProperty.days_on_market}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Motivation Score: {selectedProperty.motivation_score}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <TextField
                fullWidth
                multiline
                rows={12}
                value={outreachMessage}
                onChange={(e) => setOutreachMessage(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyMessage}
                variant="contained"
                color="primary"
              >
                Copy Message
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResultsTable;