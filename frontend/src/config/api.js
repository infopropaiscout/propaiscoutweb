export const API_CONFIG = {
  USE_MOCK_DATA: false,
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY || '',
  RAPIDAPI_HOST: 'redfin-com-data.p.rapidapi.com',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PROPERTY_SEARCH: 'https://redfin-com-data.p.rapidapi.com/properties/search-sale',
    REGION_SEARCH: 'https://redfin-com-data.p.rapidapi.com/regions/search',
    PROPERTY_DETAILS: 'https://redfin-com-data.p.rapidapi.com/properties/get-detail'
  }
};