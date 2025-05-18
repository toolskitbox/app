import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';
import BreadcrumbTrail from '../../components/common/BreadcrumbTrail';

const DevToolsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Developer Tools
        </Typography>
        <Typography variant="body1" paragraph>
          A collection of useful tools for developers.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Dev tool cards will go here */}
          <Box sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
            <Card>
              <CardActionArea component={Link} to="/tools/dev/json-formatter">
                <CardContent>
                  <Typography variant="h6">JSON Formatter</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Format and validate JSON data
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DevToolsPage;
