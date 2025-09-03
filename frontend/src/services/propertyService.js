// Mock data with realistic properties
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
    score_factors: ['Extended time on market', 'Recent price reduction'],
    year_built: 1985
  },
  {
    id: 2,
    address: '456 Park Ave, Hoboken, NJ 07030',
    price: 650000,
    price_drop: 25000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1500,
    days_on_market: 90,
    motivation_score: 75,
    estimated_repairs: 25000,
    arv: 850000,
    url: 'https://example.com/property2',
    score_factors: ['Significant market duration', 'Below market value'],
    year_built: 1990
  },
  {
    id: 3,
    address: '789 Grove St, Jersey City, NJ 07302',
    price: 899000,
    price_drop: 75000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2200,
    days_on_market: 150,
    motivation_score: 92,
    estimated_repairs: 45000,
    arv: 1150000,
    url: 'https://example.com/property3',
    score_factors: ['Extended time on market', 'Multiple price reductions'],
    year_built: 1982
  },
  {
    id: 4,
    address: '321 Washington St, Hoboken, NJ 07030',
    price: 550000,
    price_drop: 0,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 900,
    days_on_market: 45,
    motivation_score: 60,
    estimated_repairs: 20000,
    arv: 650000,
    url: 'https://example.com/property4',
    score_factors: ['Recent listing'],
    year_built: 2000
  },
  {
    id: 5,
    address: '159 Newark Ave, Jersey City, NJ 07302',
    price: 1200000,
    price_drop: 100000,
    bedrooms: 5,
    bathrooms: 4,
    square_feet: 3000,
    days_on_market: 180,
    motivation_score: 95,
    estimated_repairs: 60000,
    arv: 1500000,
    url: 'https://example.com/property5',
    score_factors: ['Extended time on market', 'Significant price reduction'],
    year_built: 1975
  }
];

class PropertyService {
  async searchProperties(filters) {
    console.log('Searching properties with filters:', filters);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter properties based on criteria
      let filteredProperties = [...MOCK_PROPERTIES];

      // Apply filters
      if (filters.min_price) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.min_price);
      }

      if (filters.max_price) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.max_price);
      }

      if (filters.max_days_on_market) {
        filteredProperties = filteredProperties.filter(p => p.days_on_market <= filters.max_days_on_market);
      }

      if (filters.min_motivation_score) {
        filteredProperties = filteredProperties.filter(p => p.motivation_score >= filters.min_motivation_score);
      }

      if (filters.property_type) {
        // For demo, just return all properties regardless of type
      }

      // Add some randomization to make it feel more realistic
      filteredProperties = filteredProperties.map(property => ({
        ...property,
        days_on_market: property.days_on_market + Math.floor(Math.random() * 10),
        motivation_score: Math.min(100, property.motivation_score + Math.floor(Math.random() * 5))
      }));

      console.log('Found properties:', filteredProperties.length);
      return filteredProperties;
    } catch (error) {
      console.error('Error in searchProperties:', error);
      throw new Error('Failed to search properties. Please try again.');
    }
  }

  async generateOutreachMessage(property) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

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
}

export const propertyService = new PropertyService();