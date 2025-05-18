import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          minHeight: '60vh'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '6rem', sm: '10rem' },
              fontWeight: 700,
              color: 'primary.main',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              mb: 2
            }}
          >
            404
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            Page Not Found
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 500, mb: 4 }}
          >
            Oops! The page you are looking for doesn't exist or has been moved.
            Let's get you back on track.
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            Back to Home
          </Button>
        </motion.div>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
