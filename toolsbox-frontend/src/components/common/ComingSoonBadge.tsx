import React from 'react';
import { Box, Typography } from '@mui/material';

const ComingSoonBadge: React.FC = () => {
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
        background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
        boxShadow: '0 2px 4px rgba(255, 152, 0, 0.3)',
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
        Soon
      </Typography>
    </Box>
  );
};

export default ComingSoonBadge;
