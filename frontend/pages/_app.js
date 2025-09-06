import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '../src/App';

const queryClient = new QueryClient();

function MyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default MyApp;
