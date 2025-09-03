import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Header = () => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const handleInfoClick = () => {
    setInfoDialogOpen(true);
  };

  return (
    <>
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
            onClick={handleInfoClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              py: 1,
              px: 2,
              borderRadius: 2,
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
              }
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

      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
            PropAI Scout: AI-Powered Lead Generation & Scoring
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" paragraph>
            PropAI Scout is an advanced real estate lead generation and scoring tool designed to help investors identify motivated sellers in the New Jersey and New York markets.
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Key Features:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Smart Property Scoring" 
                secondary="Our AI analyzes multiple factors to calculate a Motivation Score (0-100) for each property"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Comprehensive Data Analysis" 
                secondary="Days on market, price drops, market value comparison, and more"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="AI-Generated Outreach" 
                secondary="Personalized outreach messages tailored to each property's situation"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="ROI Estimation" 
                secondary="Quick offer suggestions and potential ROI calculations"
              />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Scoring Factors:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Days on Market > 90 days" 
                  secondary="+20 points"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Multiple Price Drops" 
                  secondary="+20 points"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Below Market Value" 
                  secondary="+15 points"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Absentee Owner" 
                  secondary="+25 points"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Pre-foreclosure/Auction" 
                  secondary="+30 points"
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setInfoDialogOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
