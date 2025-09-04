export const API_CONFIG = {
  USE_MOCK_DATA: false,
  RAPIDAPI_KEY: process.env.REACT_APP_RAPIDAPI_KEY || '',
  RAPIDAPI_HOST: 'redfin-com-data.p.rapidapi.com',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PROPERTY_SEARCH: 'https://redfin-com-data.p.rapidapi.com/properties/search-sale',
    PROPERTY_DETAILS: 'https://redfin-com-data.p.rapidapi.com/properties/get-detail',
    // Map of ZIP codes to region IDs
    ZIP_TO_REGION: {
      '07030': '6_2446',  // Example region ID
      '07302': '6_2447',
      '07306': '6_2448',
      '07307': '6_2449',
      '08837': '6_2450',
      '10001': '6_2451',
      '10002': '6_2452',
      '10003': '6_2453',
      '10004': '6_2454',
      '10005': '6_2455',
      '10006': '6_2456'
    }
  }
};