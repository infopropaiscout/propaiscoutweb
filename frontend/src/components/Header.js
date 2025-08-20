import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';

function Header() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <HomeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PropAI Scout
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1">
            Real Estate Lead Generation & Scoring
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
