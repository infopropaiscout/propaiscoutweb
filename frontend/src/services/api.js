const apiConfig = {
  rapidApi: {
    key: process.env.REACT_APP_RAPIDAPI_KEY || '71aba9fbb6mshf14840260f6b5c7p17980fjsn318cf304588e',
    endpoints: {
      realtor: {
        url: 'https://realtor.p.rapidapi.com/properties/v2/list-for-sale',
        host: 'realtor.p.rapidapi.com'
      },
      zillow: {
        url: 'https://zillow-com1.p.rapidapi.com/propertyExtendedSearch',
        host: 'zillow-com1.p.rapidapi.com'
      },
      realty: {
        url: 'https://realty-in-us.p.rapidapi.com/properties/list-for-sale',
        host: 'realty-in-us.p.rapidapi.com'
      },
      foreclosure: {
        url: 'https://us-foreclosure-and-tax-deed-data.p.rapidapi.com/search',
        host: 'us-foreclosure-and-tax-deed-data.p.rapidapi.com'
      }
    }
  },
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

export default apiConfig;