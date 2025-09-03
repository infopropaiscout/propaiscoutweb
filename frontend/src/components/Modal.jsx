import React from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          p: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        {children}
      </Paper>
    </Box>
  );
};

export default Modal;
