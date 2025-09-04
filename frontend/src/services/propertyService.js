import { API_CONFIG } from '../config/api';
import { redfinApiService } from './redfinApiService';
import { aiService } from './aiService';

class PropertyService {
  async searchProperties(filters) {
    console.log('Searching properties with filters:', filters);
    
    if (API_CONFIG.USE_MOCK_DATA) {
      console.log('Using mock data for property search');
      return this._getMockProperties();
    }

    try {
      // Format the filters for Realtor API
      const apiFilters = {
        location: filters.zip_codes[0], // Use first ZIP code as location
        status: 'for_sale',
        price_min: filters.min_price,
        price_max: filters.max_price,
        property_type: this._mapPropertyType(filters.property_type),
        sort: 'newest',
        limit: 50
      };

      const properties = await redfinApiService.searchProperties(apiFilters);
      
      // Filter properties by additional criteria
      const filteredProperties = properties.filter(property => {
        // Apply ZIP code filter
        if (filters.zip_codes.length > 0 && !filters.zip_codes.includes(property.address.match(/\d{5}/)?.[0])) {
          return false;
        }

        // Apply days on market filter
        if (filters.max_days_on_market && property.days_on_market > filters.max_days_on_market) {
          return false;
        }

        return true;
      });

      // Enhance properties with AI analysis
      const enhancedProperties = await Promise.all(
        filteredProperties.map(async (property) => {
          try {
            const motivationScore = await aiService.calculateMotivationScore(property);
            return {
              ...property,
              motivation_score: motivationScore,
              score: motivationScore // For backward compatibility
            };
          } catch (error) {
            console.error('Error calculating motivation score:', error);
            return {
              ...property,
              motivation_score: null,
              score: null
            };
          }
        })
      );

      // Filter by motivation score if specified
      return filters.min_motivation_score
        ? enhancedProperties.filter(p => p.motivation_score >= filters.min_motivation_score)
        : enhancedProperties;
    } catch (error) {
      console.error('Error in property search:', error);
      throw error;
    }
  }

  async getPropertyDetails(propertyId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this._getMockPropertyDetails(propertyId);
    }

    return realtorApiService.getPropertyDetails(propertyId);
  }

  async generateOutreachMessage(property) {
    return aiService.generateOutreachMessage(property);
  }

  async analyzeROI(property) {
    return aiService.analyzeROI(property);
  }

  _mapPropertyType(type) {
    const typeMap = {
      'single-family': 'single_family',
      'multi-family': 'multi_family',
      'condo': 'condo',
      '': null
    };
    return typeMap[type] || null;
  }

  _formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  _getMockProperties() {
    return [
      {
        id: '1',
        address: '123 Main St, New York, NY 10001',
        price: 500000,
        beds: 3,
        baths: 2,
        sqft: 1500,
        lot_size: 2000,
        year_built: 1990,
        property_type: 'Single Family',
        days_on_market: 30,
        url: '#',
        photos: [],
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        estimated_value: 550000,
        last_sold_price: 450000,
        last_sold_date: '2020-01-01',
        status: 'for_sale',
        motivation_score: 85,
        score: 85
      }
    ];
  }

  _getMockPropertyDetails(propertyId) {
    return {
      ...this._getMockProperties()[0],
      id: propertyId
    };
  }
}

export const propertyService = new PropertyService();