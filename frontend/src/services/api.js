import config from '../config';

// Mock data generator
const generateMockData = (filters) => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    address: `${123 + i} Main St`,
    zip_code: filters.zip_codes[0],
    price: 300000 + (i * 50000),
    square_feet: 1500 + (i * 100),
    days_on_market: 30 + (i * 15),
    price_drops: i % 3,
    property_type: ['single-family', 'multi-family', 'condo'][i % 3],
    owner_status: i % 2 === 0 ? 'owner-occupied' : 'absentee',
    tax_assessed_value: 280000 + (i * 45000),
    listing_agent: 'John Doe',
    motivation_score: 50 + (i * 5),
    suggested_offer: 250000 + (i * 40000),
    estimated_roi: 15 + (i * 2),
    predicted_resale_price: 350000 + (i * 60000),
    pre_foreclosure: i % 5 === 0,
  }));
};

class ApiService {
  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.useMockData = config.features.useMockData;
  }

  async searchProperties(filters) {
    if (this.useMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockData(filters);
    }

    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.search}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (config.features.enableLogging) {
        console.error('Search API Error:', error);
      }
      throw new Error('Failed to fetch properties. Please check your connection and try again.');
    }
  }

  async generateOutreachMessage(propertyId) {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        message: `Hi there,\n\nI noticed your property has been on the market for a while. I specialize in providing quick, hassle-free cash offers for properties in your area. Would you be interested in discussing a potential offer?\n\nBest regards,\nPropAI Scout`
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.outreach}/${propertyId}/outreach`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (config.features.enableLogging) {
        console.error('Outreach API Error:', error);
      }
      throw new Error('Failed to generate outreach message. Please try again.');
    }
  }

  async exportToCSV(data) {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Address,Price,Motivation Score\n' +
        data.map(row => `${row.address},${row.price},${row.motivation_score}`).join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }

    try {
      const response = await fetch(`${this.baseUrl}${config.api.endpoints.export}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      if (config.features.enableLogging) {
        console.error('Export API Error:', error);
      }
      throw new Error('Failed to export data. Please try again.');
    }
  }
}

export default new ApiService();
