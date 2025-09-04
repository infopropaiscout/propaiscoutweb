export const API_CONFIG = {
  USE_MOCK_DATA: false,
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY || '',
  RAPIDAPI_HOST: 'realtor.p.rapidapi.com',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PROPERTY_SEARCH: 'https://realtor.p.rapidapi.com/properties/v2/list-for-sale',
    PROPERTY_DETAILS: 'https://realtor.p.rapidapi.com/properties/v2/detail'
  }
};