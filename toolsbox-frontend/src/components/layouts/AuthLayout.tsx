import React from 'react';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.background.default,
        backgroundImage: 'url(/auth-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              mb: 2
            }}
          >
            ToolsKitBox
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}
          >
            Your All-in-One Online Toolkit
          </Typography>
        </Box>
        
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'rgba(30, 30, 30, 0.9)'
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
