import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import ComingSoonOverlay from '../../../components/common/ComingSoonOverlay';

const VideoConverterPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Video Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert video files between different formats.
        </Typography>
        
        <ComingSoonOverlay>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Video File
            </Typography>
            <Button variant="contained" component="label">
              Select File
              <input type="file" hidden />
            </Button>
          </Paper>
        </ComingSoonOverlay>
      </Box>
    </Container>
  );
};

export default VideoConverterPage;
