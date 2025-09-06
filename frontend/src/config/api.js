export const API_CONFIG = {
  USE_MOCK_DATA: false,
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY || '',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  
  // Default search locations
  DEFAULT_LOCATIONS: {
    NJ: ['Jersey City', 'Hoboken', 'Newark', 'Edison'],
    NY: ['New York', 'Brooklyn', 'Queens', 'Bronx']
  },
  
  // Default ZIP codes
  DEFAULT_ZIPS: [
    '07030', '07302', '07306', '07307', // Hoboken & Jersey City
    '10001', '10002', '10003', '10004', // Manhattan
    '11201', '11217', '11238'  // Brooklyn
  ]
};