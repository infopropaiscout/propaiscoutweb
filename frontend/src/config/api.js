export const API_CONFIG = {
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY,
  RAPIDAPI_HOSTS: {
    REALTY_IN_US: 'realty-in-us.p.rapidapi.com',
    US_REAL_ESTATE: 'us-real-estate.p.rapidapi.com'
  },
  USE_MOCK_DATA: !process.env.REACT_APP_RAPIDAPI_KEY // Use mock data if no API key is provided
};