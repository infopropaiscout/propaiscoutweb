import { API_CONFIG } from '../config/api';
import { MOCK_PROPERTIES } from './mockData';

class RapidApiService {
  constructor() {
    this.headers = {
      'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
      'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOST,
    };
  }

  async searchProperties(filters) {
    if (API_CONFIG.USE_MOCK_DATA || !API_CONFIG.RAPIDAPI_KEY) {
      console.log('Using mock data for property search');
      return this._filterMockProperties(filters);
    }

    try {
      const queryParams = new URLSearchParams({
        state: 'NJ',
        limit: '50',
        ...filters.zip_codes.length === 1 ? { zipCode: filters.zip_codes[0] } : {}
      });

      const response = await fetch(
        `https://${API_CONFIG.RAPIDAPI_HOST}/properties?${queryParams}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this._processApiResponse(data, filters);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties. Please try again.');
    }
  }

  async getPropertyDetails(propertyId) {
    if (API_CONFIG.USE_MOCK_DATA || !API_CONFIG.RAPIDAPI_KEY) {
      return MOCK_PROPERTIES.find(p => p.id === propertyId);
    }

    try {
      const response = await fetch(
        `https://${API_CONFIG.RAPIDAPI_HOST}/properties/${propertyId}`,
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

  _processApiResponse(data, filters) {
    return data.map(property => ({
      id: property.id || Math.random().toString(36).substr(2, 9),
      address: property.formattedAddress || property.address,
      price: property.price,
      price_drop: property.priceChange || 0,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.squareFootage,
      days_on_market: property.daysOnMarket || 30,
      motivation_score: this._calculateMotivationScore(property),
      estimated_repairs: this._estimateRepairs(property),
      arv: this._calculateARV(property),
      url: property.listingUrl || '',
      score_factors: this._getScoreFactors(property),
      year_built: property.yearBuilt
    })).filter(property => this._applyFilters(property, filters));
  }

  _processPropertyDetails(property) {
    return {
      ...property,
      motivation_score: this._calculateMotivationScore(property),
      estimated_repairs: this._estimateRepairs(property),
      arv: this._calculateARV(property),
      score_factors: this._getScoreFactors(property)
    };
  }

  _calculateMotivationScore(property) {
    let score = 50; // Base score

    // Days on market impact
    if (property.daysOnMarket > 90) score += 20;
    else if (property.daysOnMarket > 60) score += 15;
    else if (property.daysOnMarket > 30) score += 10;

    // Price drops impact
    if (property.priceChange && property.priceChange < 0) {
      const priceDropPercentage = Math.abs(property.priceChange / property.price) * 100;
      if (priceDropPercentage > 10) score += 20;
      else if (priceDropPercentage > 5) score += 15;
      else score += 10;
    }

    // Property condition impact
    if (property.yearBuilt && property.yearBuilt < 1980) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  _estimateRepairs(property) {
    const baseRepairCost = 20000;
    let multiplier = 1;

    if (property.yearBuilt) {
      if (property.yearBuilt < 1960) multiplier = 2;
      else if (property.yearBuilt < 1980) multiplier = 1.5;
      else if (property.yearBuilt < 2000) multiplier = 1.2;
    }

    return baseRepairCost * multiplier;
  }

  _calculateARV(property) {
    // Simple ARV calculation - can be enhanced with comps data
    return property.price * 1.3;
  }

  _getScoreFactors(property) {
    const factors = [];

    if (property.daysOnMarket > 90) factors.push('Extended time on market');
    if (property.priceChange && property.priceChange < 0) factors.push('Recent price reduction');
    if (property.yearBuilt && property.yearBuilt < 1980) factors.push('Older property');

    return factors;
  }

  _applyFilters(property, filters) {
    if (filters.min_price && property.price < filters.min_price) return false;
    if (filters.max_price && property.price > filters.max_price) return false;
    if (filters.max_days_on_market && property.days_on_market > filters.max_days_on_market) return false;
    if (filters.min_motivation_score && property.motivation_score < filters.min_motivation_score) return false;
    return true;
  }

  _filterMockProperties(filters) {
    return MOCK_PROPERTIES.filter(property => this._applyFilters(property, filters));
  }
}

export const rapidApiService = new RapidApiService();
