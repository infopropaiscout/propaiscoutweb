import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
    },
    background: {
      default: '#F8FAFC',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            PropAI Scout
          </Typography>
          <Typography variant="body1">
            Real Estate Lead Generation and Scoring
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;