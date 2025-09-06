export const propertyService = {
  fetchProperties: async (filters) => {
    try {
      const queryParams = new URLSearchParams({
        zipCode: filters.zipCode || '',
        city: filters.city || '',
        state: filters.state || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        page: filters.page || '1'
      }).toString();

      const response = await fetch(`/api/listings?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }

      const data = await response.json();
      return data.properties;
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