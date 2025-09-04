export const API_CONFIG = {
  USE_MOCK_DATA: false,
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY || '',
    RAPIDAPI_HOST: 'realtor-com4.p.rapidapi.com',
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PROPERTY_SEARCH: 'https://realtor-com4.p.rapidapi.com/properties/list_v2',
    PROPERTY_DETAILS: 'https://realtor-com4.p.rapidapi.com/properties/detail'
  }
};