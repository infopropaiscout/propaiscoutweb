import { API_CONFIG } from '../config/api';

class RealtorApiService {
  constructor() {
    this.headers = {
      'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
      'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOST,
      'Content-Type': 'application/json'
    };
  }

  async searchProperties(filters) {
    try {
      // Format location for ZIP code search
      const location = this._formatLocation(filters.location);
      
      // Convert filters to Realtor.com API format
      const queryParams = new URLSearchParams({
        postal_code: location,
        offset: filters.offset || '0',
        limit: filters.limit || '50',
        ...filters.price_min ? { price_min: filters.price_min.toString() } : {},
        ...filters.price_max ? { price_max: filters.price_max.toString() } : {},
        ...filters.property_type ? { prop_type: filters.property_type } : {},
        sort: filters.sort || 'newest'
      });

      console.log('Searching with params:', queryParams.toString());

      const response = await fetch(
        `${API_CONFIG.ENDPOINTS.PROPERTY_SEARCH}?${queryParams}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return this._processSearchResponse(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties. Please try again.');
    }
  }

  _formatLocation(location) {
    // Check if location is a ZIP code
    if (/^\d{5}$/.test(location)) {
      return location;
    }
    // Default to New York if no location provided
    return location || 'New-York_NY';
  }

  async getPropertyDetails(propertyId) {
    try {
      const response = await fetch(
        `${API_CONFIG.ENDPOINTS.PROPERTY_DETAILS}?property_id=${propertyId}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this._processPropertyDetails(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw new Error('Failed to fetch property details. Please try again.');
    }
  }

  _processSearchResponse(data) {
    if (!data?.properties) {
      console.log('No properties found in response:', data);
      return [];
    }

    return data.properties.map(property => ({
      id: property.property_id,
      address: `${property.address.line}, ${property.address.city}, ${property.address.state_code} ${property.address.postal_code}`,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.building_size?.size || null,
      lot_size: property.lot_size?.size || null,
      year_built: property.year_built,
      property_type: property.prop_type,
      days_on_market: property.days_on_market || this._calculateDaysOnMarket(property.list_date),
      url: property.rdc_web_url,
      photos: property.photo_count > 0 ? [property.thumbnail] : [],
      location: {
        latitude: property.address.lat,
        longitude: property.address.lon
      },
      estimated_value: null, // Not available in this API response
      last_sold_price: property.last_sold?.price,
      last_sold_date: property.last_sold?.date,
      status: property.prop_status,
      raw_data: property // Keep raw data for detailed analysis
    }));
  }

  _processPropertyDetails(data) {
    // Process detailed property data when needed
    return data;
  }

  _calculateDaysOnMarket(listDate) {
    if (!listDate) return null;
    const listDateTime = new Date(listDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - listDateTime) / (1000 * 60 * 60 * 24));
  }
}

export const realtorApiService = new RealtorApiService();