import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import ComingSoonOverlay from '../../../components/common/ComingSoonOverlay';

const ImageToolsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Image Tools
        </Typography>
        <Typography variant="body1" paragraph>
          A collection of tools for image editing and conversion.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
            <ComingSoonOverlay>
              <Card>
                <CardActionArea component={Link} to="#">
                  <CardContent>
                    <Typography variant="h6">Image Resizer</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resize images to your desired dimensions
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </ComingSoonOverlay>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
            <ComingSoonOverlay>
              <Card>
                <CardActionArea component={Link} to="#">
                  <CardContent>
                    <Typography variant="h6">Image Converter</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Convert images between different formats
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </ComingSoonOverlay>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ImageToolsPage;
