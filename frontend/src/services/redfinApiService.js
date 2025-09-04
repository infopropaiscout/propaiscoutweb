import { API_CONFIG } from '../config/api';

class RedfinApiService {
  constructor() {
    this.headers = {
      'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
      'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOST,
      'Content-Type': 'application/json'
    };
  }

  async searchProperties(filters) {
    try {
      // First, get the region ID for the ZIP code
      const regionId = await this._getRegionId(filters.zip_codes[0]);
      if (!regionId) {
        throw new Error('Region not found for the given ZIP code');
      }

      console.log('Making property search request with regionId:', regionId);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        regionId: regionId,
        page: '1',
        ...filters.min_price ? { minPrice: filters.min_price.toString() } : {},
        ...filters.max_price ? { maxPrice: filters.max_price.toString() } : {},
        ...filters.property_type ? { propertyType: this._mapPropertyType(filters.property_type) } : {}
      });

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
      return this._processSearchResponse(data, filters);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async _getRegionId(zipCode) {
    try {
      console.log('Getting region ID for ZIP code:', zipCode);
      
      const regionId = API_CONFIG.ENDPOINTS.ZIP_TO_REGION[zipCode];
      if (!regionId) {
        throw new Error(`No region ID mapping found for ZIP code: ${zipCode}. Currently supported ZIP codes: ${Object.keys(API_CONFIG.ENDPOINTS.ZIP_TO_REGION).join(', ')}`);
      }

      console.log('Found region ID:', regionId);
      return regionId;
    } catch (error) {
      console.error('Error searching region:', error);
      throw error;
    }
  }

  async getPropertyDetails(propertyId) {
    try {
      const response = await fetch(
        `${API_CONFIG.ENDPOINTS.PROPERTY_DETAILS}?propertyId=${propertyId}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`Property details request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this._processPropertyDetails(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error;
    }
  }

  _processSearchResponse(data, filters) {
    if (!data?.properties) {
      console.log('No properties found in response:', data);
      return [];
    }

    const properties = data.properties.map(property => ({
      id: property.propertyId || property.id,
      address: `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipcode}`,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      lot_size: property.lotSize,
      year_built: property.yearBuilt,
      property_type: property.propertyType,
      days_on_market: property.daysOnMarket,
      url: property.url,
      photos: property.photos || [],
      location: {
        latitude: property.latitude,
        longitude: property.longitude
      },
      estimated_value: property.estimatedValue,
      last_sold_price: property.lastSoldPrice,
      last_sold_date: property.lastSoldDate,
      status: property.status,
      raw_data: property
    }));

    // Apply additional filters
    return properties.filter(property => {
      if (filters.max_days_on_market && property.days_on_market > filters.max_days_on_market) {
        return false;
      }
      return true;
    });
  }

  _processPropertyDetails(data) {
    return data;
  }

  _mapPropertyType(type) {
    const typeMap = {
      'single-family': 'SINGLE_FAMILY',
      'multi-family': 'MULTI_FAMILY',
      'condo': 'CONDO',
      '': null
    };
    return typeMap[type] || null;
  }

  _calculateDaysOnMarket(listDate) {
    if (!listDate) return null;
    const listDateTime = new Date(listDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - listDateTime) / (1000 * 60 * 60 * 24));
  }
}

export const redfinApiService = new RedfinApiService();
