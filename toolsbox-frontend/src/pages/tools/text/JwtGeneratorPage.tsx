import React from 'react';
import { Box, Typography, Container, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import ComingSoonOverlay from '../../../components/common/ComingSoonOverlay';

const JwtGeneratorPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JWT Generator
        </Typography>
        <Typography variant="body1" paragraph>
          Generate and validate JSON Web Tokens (JWT) for your applications.
        </Typography>
        
        <ComingSoonOverlay>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate JWT
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Algorithm</InputLabel>
              <Select label="Algorithm" defaultValue="HS256">
                <MenuItem value="HS256">HS256</MenuItem>
                <MenuItem value="HS384">HS384</MenuItem>
                <MenuItem value="HS512">HS512</MenuItem>
                <MenuItem value="RS256">RS256</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Secret Key"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Payload (JSON)"
              fullWidth
              multiline
              rows={6}
              defaultValue={`{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}`}
              sx={{ mb: 2 }}
            />
            
            <Button variant="contained" sx={{ mr: 1 }}>
              Generate Token
            </Button>
            
            <Button variant="outlined">
              Validate Token
            </Button>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Generated Token
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Your JWT will appear here"
                InputProps={{ readOnly: true }}
              />
            </Box>
          </Paper>
        </ComingSoonOverlay>
      </Box>
    </Container>
  );
};

export default JwtGeneratorPage;
