import React, { useEffect } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';

const TempEmailPage: React.FC = () => {
  useEffect(() => {
    // Redirect to mohmal.com directly
    window.location.href = 'https://mohmal.com';
  }, []);

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Box sx={{ mt: 2 }}>Redirecting to Mohmal temporary email service...</Box>
      </Box>
    </Container>
  );
};

export default TempEmailPage;
