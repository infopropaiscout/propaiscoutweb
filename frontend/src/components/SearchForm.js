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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    zip_codes: '',
    property_type: '',
    min_price: '',
    max_price: '',
    max_days_on_market: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const zip_codes = formData.zip_codes.split(',').map(zip => zip.trim());
    onSearch({
      ...formData,
      zip_codes,
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      max_days_on_market: formData.max_days_on_market ? parseInt(formData.max_days_on_market) : null,
    });
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Property Search
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Codes (comma-separated)"
                name="zip_codes"
                value={formData.zip_codes}
                onChange={handleChange}
                placeholder="e.g., 07302, 10001"
                required
              />
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Price"
                name="min_price"
                type="number"
                value={formData.min_price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Price"
                name="max_price"
                type="number"
                value={formData.max_price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Days on Market"
                name="max_days_on_market"
                type="number"
                value={formData.max_days_on_market}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                sx={{ mt: 2 }}
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
