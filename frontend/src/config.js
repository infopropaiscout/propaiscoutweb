const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  // API Configuration
  api: {
    baseUrl: isDevelopment ? 'http://localhost:8000' : 'https://api.propaiscout.com',
    endpoints: {
      search: '/api/search',
      export: '/api/export',
      outreach: '/api/property',
    },
  },
  
  // Feature Flags
  features: {
    useMockData: isDevelopment, // Use mock data in development
    enableLogging: isDevelopment,
  },
};

export default config;
