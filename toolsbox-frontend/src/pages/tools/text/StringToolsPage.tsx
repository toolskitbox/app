import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const StringToolsPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          String Tools
        </Typography>
        <Typography variant="body1" paragraph>
          Various tools for string manipulation.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Input Text"
            multiline
            rows={4}
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(inputText.toUpperCase())}
              >
                To Uppercase
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(inputText.toLowerCase())}
              >
                To Lowercase
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(inputText.split('').reverse().join(''))}
              >
                Reverse
              </Button>
            </Box>
          </Box>
          
          <TextField
            label="Output Text"
            multiline
            rows={4}
            fullWidth
            value={outputText}
            InputProps={{
              readOnly: true,
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default StringToolsPage;
