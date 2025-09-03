import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Mock data for fallback
const MOCK_PROPERTIES = [
  {
    id: 1,
    address: '123 Main St, Jersey City, NJ 07302',
    price: 750000,
    price_drop: 50000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1800,
    days_on_market: 120,
    motivation_score: 85,
    estimated_repairs: 30000,
    arv: 950000,
    url: 'https://example.com/property1',
  },
  {
    id: 2,
    address: '456 Park Ave, Hoboken, NJ 07030',
    price: 650000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1500,
    days_on_market: 90,
    motivation_score: 75,
    estimated_repairs: 25000,
    arv: 850000,
    url: 'https://example.com/property2',
  }
];

class PropertyService {
  constructor() {
    console.log('PropertyService initialized with config:', {
      hasApiKey: !!API_CONFIG.RAPIDAPI_KEY,
      useMockData: API_CONFIG.USE_MOCK_DATA
    });

    this.realtyApi = axios.create({
      headers: {
        'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
        'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOSTS.REALTY_IN_US
      }
    });

    this.usRealEstateApi = axios.create({
      headers: {
        'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
        'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOSTS.US_REAL_ESTATE
      }
    });
  }

  async searchProperties(filters) {
    console.log('Searching properties with filters:', filters);
    console.log('API Key present:', !!API_CONFIG.RAPIDAPI_KEY);
    
    try {
      // For now, return mock data while we debug the API integration
      console.log('Using mock data for testing');
      const mockResults = this._filterMockProperties(filters);
      console.log('Found mock properties:', mockResults.length);
      return mockResults;

      /* Commented out API calls for debugging
      if (!API_CONFIG.RAPIDAPI_KEY) {
        console.log('No API key found, falling back to mock data');
        return this._filterMockProperties(filters);
      }

      // Fetch properties from multiple sources
      const properties = await this._fetchPropertiesFromAllSources(filters);
      
      // Score and enrich the properties
      const enrichedProperties = await this._enrichProperties(properties);
      
      console.log('Found properties:', enrichedProperties.length);
      return enrichedProperties;
      */
    } catch (error) {
      console.error('Error in searchProperties:', error);
      if (error.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // Return mock data on error
      console.log('Error occurred, falling back to mock data');
      return this._filterMockProperties(filters);
    }
  }

  // ... rest of the existing methods ...

  _filterMockProperties(filters) {
    let properties = [...MOCK_PROPERTIES];

    if (filters.min_price) {
      properties = properties.filter(p => p.price >= filters.min_price);
    }

    if (filters.max_price) {
      properties = properties.filter(p => p.price <= filters.max_price);
    }

    if (filters.max_days_on_market) {
      properties = properties.filter(p => p.days_on_market <= filters.max_days_on_market);
    }

    if (filters.min_motivation_score) {
      properties = properties.filter(p => p.motivation_score >= filters.min_motivation_score);
    }

    // Add some random delay to simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(properties);
      }, 1000);
    });
  }
}

export const propertyService = new PropertyService();