import React from 'react';
import { Box, Typography } from '@mui/material';

const PartialBadge: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 1,
        px: 1,
        py: 0.25,
        borderRadius: '4px',
        background: 'linear-gradient(45deg, #FFC107 30%, #FF9800 90%)',
        boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)',
        transform: 'translateY(-1px)'
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          fontSize: '0.65rem',
          lineHeight: 1,
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        Partial
      </Typography>
    </Box>
  );
};

export default PartialBadge;
