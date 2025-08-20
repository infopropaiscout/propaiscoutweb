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
  Chip,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const NJ_NYC_ZIPS = {
  'New Jersey': ['07302', '07030', '07310', '07306', '07307', '08837'],
  'New York City': ['10001', '10002', '10003', '10004', '10005', '10006']
};

function SearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    zip_codes: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleZipSelect = (zip) => {
    if (selectedZips.includes(zip)) {
      setSelectedZips(selectedZips.filter(z => z !== zip));
    } else {
      setSelectedZips([...selectedZips, zip]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Property Search
            <Tooltip title="Search for motivated seller leads in NJ & NYC markets">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select ZIP Codes (NJ & NYC)
              </Typography>
              <Box sx={{ mb: 2 }}>
                {Object.entries(NJ_NYC_ZIPS).map(([region, zips]) => (
                  <Box key={region} sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      {region}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {zips.map((zip) => (
                        <Chip
                          key={zip}
                          label={zip}
                          onClick={() => handleZipSelect(zip)}
                          color={selectedZips.includes(zip) ? "primary" : "default"}
                          variant={selectedZips.includes(zip) ? "filled" : "outlined"}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

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

            <Grid item xs={12}>
              <Button
                fullWidth
                onClick={() => setShowAdvanced(!showAdvanced)}
                endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mb: 2 }}
              >
                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </Button>

              <Collapse in={showAdvanced}>
                <Grid container spacing={3}>
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
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SearchIcon />}
                disabled={selectedZips.length === 0}
              >
                Search Properties
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

export default SearchForm;