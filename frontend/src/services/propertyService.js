import { API_CONFIG } from '../config/api';
import { aiService } from './aiService';

class PropertyService {
  async searchProperties(filters) {
    console.log('Searching properties with filters:', filters);
    
    if (API_CONFIG.USE_MOCK_DATA) {
      console.log('Using mock data for property search');
      return this._getMockProperties();
    }

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        ...(filters.zip_codes?.length > 0 ? { zipCode: filters.zip_codes[0] } : {}),
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.state ? { state: filters.state } : {}),
        ...(filters.min_price ? { minPrice: filters.min_price } : {}),
        ...(filters.max_price ? { maxPrice: filters.max_price } : {}),
        page: '1'
      });

      // Call our backend API
      const response = await fetch(`/api/listings?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }

      const data = await response.json();
      
      // Enhance properties with AI analysis
      const enhancedProperties = await Promise.all(
        data.properties.map(async (property) => {
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

      return enhancedProperties;
    } catch (error) {
      console.error('Error in property search:', error);
      throw error;
    }
  }

  async getPropertyDetails(propertyId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      return this._getMockPropertyDetails(propertyId);
    }

    // For MVP, we'll return the basic property data
    // In the future, we can add a detailed property endpoint
    return propertyId;
  }

  async generateOutreachMessage(property) {
    return aiService.generateOutreachMessage(property);
  }

  async analyzeROI(property) {
    return aiService.analyzeROI(property);
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
        address: '123 Main St, Jersey City, NJ 07302',
        price: 500000,
        beds: 3,
        baths: 2,
        sqft: 1500,
        image: 'https://via.placeholder.com/300x200',
        url: '#',
        provider: 'Mock Data',
        motivation_score: 85
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