import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

interface ComingSoonOverlayProps {
  children: React.ReactNode;
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ children }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Paper
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 10,
          borderRadius: 'inherit',
          backdropFilter: 'blur(3px)'
        }}
        elevation={0}
      >
        <Chip
          label="Coming Soon"
          sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            padding: '24px 12px',
            height: 'auto',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}/>
      </Paper>
    </Box>
  );
};

export default ComingSoonOverlay;
