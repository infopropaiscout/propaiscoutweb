import { API_CONFIG } from '../../config/api';

class BasePropertyProvider {
  constructor() {
    this.headers = {
      'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
      'Content-Type': 'application/json',
    };
  }

  async searchProperties(filters) {
    throw new Error('Method not implemented');
  }

  async getPropertyDetails(propertyId) {
    throw new Error('Method not implemented');
  }

  _processApiResponse(data) {
    throw new Error('Method not implemented');
  }
}

class RealtorProvider extends BasePropertyProvider {
  constructor() {
    super();
    this.headers['X-RapidAPI-Host'] = 'realtor-com.p.rapidapi.com';
  }

  // Implementation will be added once we have the API details
}

class RedfinProvider extends BasePropertyProvider {
  constructor() {
    super();
    this.headers['X-RapidAPI-Host'] = 'redfin-com-data.p.rapidapi.com';
  }

  // Implementation will be added once we have the API details
}

// Factory to get the appropriate provider
export const getPropertyProvider = () => {
  switch (API_CONFIG.PROPERTY_API_PROVIDER) {
    case 'realtor':
      return new RealtorProvider();
    case 'redfin':
      return new RedfinProvider();
    default:
      throw new Error('Invalid property API provider specified');
  }
};
