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
        location,
        status: filters.status || 'for_sale',
        ...filters.price_min ? { price_min: filters.price_min } : {},
        ...filters.price_max ? { price_max: filters.price_max } : {},
        ...filters.property_type ? { property_type: filters.property_type } : {},
        ...filters.sort ? { sort: filters.sort } : {},
        limit: filters.limit || 50,
        offset: filters.offset || 0
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
    if (!data?.data?.home_search?.results) {
      return [];
    }

    return data.data.home_search.results.map(property => ({
      id: property.property_id,
      address: `${property.location.address.line}, ${property.location.address.city}, ${property.location.address.state_code} ${property.location.address.postal_code}`,
      price: property.list_price,
      beds: property.description.beds,
      baths: property.description.baths,
      sqft: property.description.sqft,
      lot_size: property.description.lot_sqft,
      year_built: property.description.year_built,
      property_type: property.description.type,
      days_on_market: this._calculateDaysOnMarket(property.list_date),
      url: property.href,
      photos: property.photos?.map(photo => photo.href) || [],
      location: {
        latitude: property.location.address.coordinate?.lat,
        longitude: property.location.address.coordinate?.lon
      },
      estimated_value: property.current_estimates?.[0]?.estimate || null,
      last_sold_price: property.last_sold_price,
      last_sold_date: property.last_sold_date,
      status: property.status,
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