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
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ActionButtons } from './ActionButtons';

const ResultsTable = ({ results = [], isLoading, onExport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
                        <ActionButtons property={property} />
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
  );
};

export default ResultsTable;