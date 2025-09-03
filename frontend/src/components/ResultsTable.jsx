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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  TablePagination,
  TableSortLabel,
  Stack,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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

const OutreachDialog = ({ open, onClose, property }) => {
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  React.useEffect(() => {
    if (open && property) {
      const generatedMessage = `Hi,

I noticed your property at ${property.address} has been on the market for ${property.days_on_market} days${property.price_drop ? ' and recently had a price reduction' : ''}.

I'm a local investor specializing in quick, hassle-free transactions, and I may be able to offer you a faster exit. Based on my analysis:

- Current asking price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
- Quick offer suggestion: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price * 0.85)}
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

      setMessage(generatedMessage);
    }
  }, [open, property]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  if (!property) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                    Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
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
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" variant="filled">
          Message copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

const ResultsTable = ({ results = [], isLoading, onExport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [outreachDialogOpen, setOutreachDialogOpen] = useState(false);
  const [orderBy, setOrderBy] = useState('motivation_score');
  const [order, setOrder] = useState('desc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
                        </Typography>
                        {property.price_drop > 0 && (
                          <Typography variant="body2" color="error">
                            ↓ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price_drop)}
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
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View ROI Analysis">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedProperty(property);
                                setRoiDialogOpen(true);
                              }}
                            >
                              <TrendingUpIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Generate Outreach Message">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedProperty(property);
                                setOutreachDialogOpen(true);
                              }}
                            >
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Property">
                            <IconButton
                              size="small"
                              onClick={() => window.open(property.url, '_blank')}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
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

      <ROIDialog
        open={roiDialogOpen}
        onClose={() => {
          setRoiDialogOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
      />

      <OutreachDialog
        open={outreachDialogOpen}
        onClose={() => {
          setOutreachDialogOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
      />
    </>
  );
};

export default ResultsTable;
