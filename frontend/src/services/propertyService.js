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
    } catch (error) {
      console.error('Error in searchProperties:', error);
      if (error.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // Fallback to mock data on error
      console.log('Error occurred, falling back to mock data');
      return this._filterMockProperties(filters);
    }
  }

  async _fetchPropertiesFromAllSources(filters) {
    try {
      console.log('Fetching properties from APIs...');
      
      // Prepare API parameters for Realty in US
      const realtyParams = {
        postal_code: filters.zip_codes[0],
        offset: '0',
        limit: '50',
        sort: 'newest',
        price_min: filters.min_price || '0',
        price_max: filters.max_price || '10000000',
        prop_type: this._mapPropertyType(filters.property_type)
      };

      console.log('Realty API parameters:', realtyParams);

      // Fetch from Realty in US API
      console.log('Fetching from Realty in US API...');
      const realtyResponse = await this.realtyApi.get('https://realty-in-us.p.rapidapi.com/properties/v3/list-for-sale', {
        params: realtyParams
      });
      console.log('Realty API response received:', {
        status: realtyResponse.status,
        dataLength: realtyResponse.data?.listings?.length || 0
      });

      // Prepare API parameters for US Real Estate
      const usRealEstateParams = {
        location: filters.zip_codes[0],
        page: '1',
        sort: 'relevant',
        type: this._mapPropertyTypeForUSRealEstate(filters.property_type),
        price_min: filters.min_price,
        price_max: filters.max_price
      };

      console.log('US Real Estate API parameters:', usRealEstateParams);

      // Fetch from US Real Estate API
      console.log('Fetching from US Real Estate API...');
      const usRealEstateResponse = await this.usRealEstateApi.get('https://us-real-estate.p.rapidapi.com/v3/for-sale', {
        params: usRealEstateParams
      });
      console.log('US Real Estate API response received:', {
        status: usRealEstateResponse.status,
        dataLength: usRealEstateResponse.data?.data?.results?.length || 0
      });

      // Combine and deduplicate results
      const combinedProperties = [
        ...this._mapRealtyProperties(realtyResponse.data?.listings || []),
        ...this._mapUSRealEstateProperties(usRealEstateResponse.data?.data?.results || [])
      ];

      const dedupedProperties = this._deduplicateProperties(combinedProperties);
      console.log('Total properties after deduplication:', dedupedProperties.length);

      return dedupedProperties;
    } catch (error) {
      console.error('Error in _fetchPropertiesFromAllSources:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }

  async _enrichProperties(properties) {
    return properties.map(property => ({
      ...property,
      motivation_score: this._calculateMotivationScore(property),
      score_factors: this._getScoreFactors(property),
      estimated_repairs: this._estimateRepairs(property),
      arv: this._calculateARV(property)
    }));
  }

  _calculateMotivationScore(property) {
    let score = 50; // Base score

    // Days on market scoring
    if (property.days_on_market > 90) score += 20;
    else if (property.days_on_market > 60) score += 15;
    else if (property.days_on_market > 30) score += 10;

    // Price drops
    if (property.price_drop) {
      const dropPercentage = (property.price_drop / property.price) * 100;
      if (dropPercentage > 10) score += 20;
      else if (dropPercentage > 5) score += 15;
      else score += 10;
    }

    // Below market value
    if (property.estimated_value && property.price < property.estimated_value) {
      const difference = ((property.estimated_value - property.price) / property.estimated_value) * 100;
      if (difference > 15) score += 15;
      else if (difference > 10) score += 10;
      else if (difference > 5) score += 5;
    }

    return Math.min(100, score);
  }

  _getScoreFactors(property) {
    const factors = [];

    if (property.days_on_market > 90) factors.push('Extended time on market');
    if (property.days_on_market > 60) factors.push('Significant market duration');
    if (property.price_drop) factors.push('Recent price reduction');
    if (property.estimated_value && property.price < property.estimated_value) {
      factors.push('Below market value');
    }

    return factors;
  }

  _estimateRepairs(property) {
    // Basic repair estimate based on property age and size
    const baseRepair = 25000;
    const ageMultiplier = property.year_built ? Math.max(0, (2024 - property.year_built) / 50) : 1;
    const sizeMultiplier = property.square_feet ? property.square_feet / 1500 : 1;
    
    return Math.round(baseRepair * ageMultiplier * sizeMultiplier);
  }

  _calculateARV(property) {
    // After Repair Value calculation
    const repairValue = this._estimateRepairs(property);
    const marketAppreciation = 1.2; // Assumed 20% market appreciation after repairs
    return Math.round((property.price + repairValue) * marketAppreciation);
  }

  _mapRealtyProperties(listings) {
    return listings.map(listing => ({
      id: listing.property_id || listing.listing_id,
      address: listing.location?.address?.line 
        ? `${listing.location.address.line}, ${listing.location.address.city}, ${listing.location.address.state} ${listing.location.address.postal_code}`
        : listing.address,
      price: listing.list_price || listing.price,
      price_drop: listing.price_reduced_amount || 0,
      bedrooms: listing.description?.beds || listing.beds,
      bathrooms: listing.description?.baths || listing.baths,
      square_feet: listing.description?.sqft || listing.building_size?.size || 0,
      days_on_market: listing.days_on_market || 0,
      year_built: listing.description?.year_built || listing.year_built,
      estimated_value: listing.estimated_value,
      url: listing.rdc_web_url || listing.web_url,
      property_type: listing.prop_type || listing.property_type,
      photos: listing.photos || (listing.photo ? [listing.photo] : [])
    }));
  }

  _mapUSRealEstateProperties(results) {
    return results.map(result => ({
      id: result.property_id || Math.random().toString(36).substr(2, 9),
      address: result.location?.address?.line 
        ? `${result.location.address.line}, ${result.location.address.city}, ${result.location.address.state} ${result.location.address.postal_code}`
        : result.address,
      price: result.list_price || result.price,
      price_drop: result.price_reduced_amount || 0,
      bedrooms: result.description?.beds || result.beds,
      bathrooms: result.description?.baths || result.baths,
      square_feet: result.description?.sqft || result.building_size,
      days_on_market: result.days_on_market || 0,
      year_built: result.description?.year_built || result.year_built,
      estimated_value: result.estimated_value,
      url: result.url,
      property_type: result.description?.type || result.property_type,
      photos: result.photos || []
    }));
  }

  _deduplicateProperties(properties) {
    const seen = new Set();
    return properties.filter(property => {
      const duplicate = seen.has(property.address);
      seen.add(property.address);
      return !duplicate;
    });
  }

  _mapPropertyType(type) {
    const typeMap = {
      'single-family': 'single_family',
      'multi-family': 'multi_family',
      'condo': 'condo'
    };
    return typeMap[type] || 'single_family';
  }

  _mapPropertyTypeForUSRealEstate(type) {
    const typeMap = {
      'single-family': 'single-family',
      'multi-family': 'multi-family',
      'condo': 'condo-apt'
    };
    return typeMap[type] || 'single-family';
  }

  async generateOutreachMessage(property) {
    try {
      const message = `Hi,

I noticed your property at ${property.address} has been on the market for ${property.days_on_market} days${property.price_drop ? ' and recently had a price reduction' : ''}.

I'm a local investor specializing in quick, hassle-free transactions, and I may be able to offer you a faster exit. Based on my analysis:

- Current asking price: ${this._formatCurrency(property.price)}
- Quick offer suggestion: ${this._formatCurrency(property.price * 0.85)}
- Closing timeline: As quick as 14 days

Key Benefits of Working with Me:
- No real estate commissions
- No repairs or renovations needed
- Flexible closing timeline
- All cash offer
- Quick and simple process

Would you be open to a conversation about your property? I can be flexible with the closing timeline and terms to meet your needs.

Best regards,
[Your name]

P.S. I'm ready to move forward quickly if this opportunity interests you.`;

      return message;
    } catch (error) {
      console.error('Error generating message:', error);
      throw new Error('Failed to generate outreach message. Please try again.');
    }
  }

  _formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

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

    return properties;
  }
}

export const propertyService = new PropertyService();