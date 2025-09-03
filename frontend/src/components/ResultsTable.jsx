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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';

function ResultsTable({ results = [], isLoading, onExport, onROIClick, onMessageClick }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('motivation_score');
  const [order, setOrder] = useState('desc');

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
                            onClick={() => {
                              console.log('ROI button clicked for property:', property);
                              onROIClick(property);
                            }}
                            startIcon={<TrendingUpIcon />}
                          >
                            ROI
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              console.log('Message button clicked for property:', property);
                              onMessageClick(property);
                            }}
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
    </Box>
  );
}

export default ResultsTable;