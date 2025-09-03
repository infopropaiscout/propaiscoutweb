import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
} from '@mui/material';

function TestDialog() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    console.log('Button clicked');
    setOpen(true);
  };

  const handleClose = () => {
    console.log('Dialog closing');
    setOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test Dialog Component
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleClick}
        sx={{ mb: 2 }}
      >
        Open Test Dialog
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogContent>
          <Typography>
            If you can see this, the dialog is working!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TestDialog;
