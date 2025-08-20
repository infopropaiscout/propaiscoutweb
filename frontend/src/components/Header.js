import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

function Header() {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.100',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: 2,
            p: 1,
            mr: 2,
          }}
        >
          <AutoGraphIcon sx={{ color: 'white' }} />
        </Box>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          PropAI Scout
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            py: 1,
            px: 2,
            borderRadius: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <SearchIcon sx={{ color: 'primary.main' }} />
          <Typography 
            variant="subtitle2"
            sx={{ 
              color: 'primary.main',
              fontWeight: 500,
            }}
          >
            Lead Generation & Scoring
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;