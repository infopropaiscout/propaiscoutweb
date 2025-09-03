export const propertyService = {
  fetchProperties: async (filters) => {
    // For now, return mock data
    return [
      {
        id: 1,
        address: '123 Main St, Newark, NJ',
        price: 350000,
        price_drop: 25000,
        days_on_market: 95,
        motivation_score: 85,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1800,
        score_factors: ['Price reduced recently', 'Long time on market'],
        estimated_repairs: 25000,
        arv: 450000,
        url: 'https://example.com/property/1'
      },
      {
        id: 2,
        address: '456 Oak Ave, Jersey City, NJ',
        price: 425000,
        price_drop: 0,
        days_on_market: 45,
        motivation_score: 65,
        bedrooms: 4,
        bathrooms: 2.5,
        square_feet: 2200,
        score_factors: ['Absentee owner'],
        estimated_repairs: 35000,
        arv: 550000,
        url: 'https://example.com/property/2'
      }
    ];
  },

  generateOutreachMessage: (property) => {
    return `Hi,

I noticed your property at ${property.address} has been on the market for ${property.days_on_market} days${property.price_drop ? ' and recently had a price reduction' : ''}.

I'm a local investor specializing in quick, hassle-free transactions, and I may be able to offer you a faster exit. Based on my analysis:

- Current asking price: $${property.price.toLocaleString()}
- Quick offer suggestion: $${(property.price * 0.85).toLocaleString()}
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
  }
};