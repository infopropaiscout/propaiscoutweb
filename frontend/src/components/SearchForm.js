import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SUGGESTED_AREAS = {
  'Popular NJ Areas': ['07302', '07030', '07310', '07306', '07307', '08837'],
  'Popular NYC Areas': ['10001', '10002', '10003', '10004', '10005', '10006']
};

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    property_type: '',
    min_price: '',
    max_price: '',
    max_days_on_market: '',
    min_motivation_score: '',
    include_foreclosures: true,
    include_absentee: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedZips, setSelectedZips] = useState([]);
  const [zipInput, setZipInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddZip = (zip) => {
    if (zip && /^\d{5}$/.test(zip) && !selectedZips.includes(zip)) {
      setSelectedZips([...selectedZips, zip]);
      setZipInput('');
    }
  };

  const handleRemoveZip = (zip) => {
    setSelectedZips(selectedZips.filter(z => z !== zip));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedZips.length === 0) return;

    onSearch({
      ...formData,
      zip_codes: selectedZips,
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      max_days_on_market: formData.max_days_on_market ? parseInt(formData.max_days_on_market) : null,
      min_motivation_score: formData.min_motivation_score ? parseInt(formData.min_motivation_score) : 0,
    });
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 3, overflow: 'visible' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Find Motivated Sellers
            <Tooltip title="Search for motivated seller leads in NJ & NYC markets">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Search Area
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter ZIP code (e.g., 07302)"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddZip(zipInput);
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button 
                              onClick={() => handleAddZip(zipInput)}
                              disabled={!zipInput || !/^\d{5}$/.test(zipInput)}
                            >
                              Add
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  {selectedZips.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedZips.map((zip) => (
                          <Chip
                            key={zip}
                            label={zip}
                            onDelete={() => handleRemoveZip(zip)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Suggested Areas:
                    </Typography>
                    {Object.entries(SUGGESTED_AREAS).map(([region, zips]) => (
                      <Box key={region} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {region}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          {zips.map((zip) => (
                            <Chip
                              key={zip}
                              label={zip}
                              onClick={() => handleAddZip(zip)}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                opacity: selectedZips.includes(zip) ? 0.5 : 1,
                                pointerEvents: selectedZips.includes(zip) ? 'none' : 'auto'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Property Criteria
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      label="Property Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="single-family">Single Family</MenuItem>
                      <MenuItem value="multi-family">Multi Family</MenuItem>
                      <MenuItem value="condo">Condo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Days on Market"
                    name="max_days_on_market"
                    type="number"
                    value={formData.max_days_on_market}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">days</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mb: showAdvanced ? 2 : 0 }}
                color="inherit"
              >
                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </Button>

              <Collapse in={showAdvanced}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Price"
                      name="min_price"
                      type="number"
                      value={formData.min_price}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Maximum Price"
                      name="max_price"
                      type="number"
                      value={formData.max_price}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Motivation Score"
                      name="min_motivation_score"
                      type="number"
                      value={formData.min_motivation_score}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">/100</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              disabled={selectedZips.length === 0}
              sx={{ 
                mt: 2,
                height: 56,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              Search Properties
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;