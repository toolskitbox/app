import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const CaseConverterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  };

  const toSnakeCase = (str: string) => {
    return str
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/^_/, '')
      .toLowerCase();
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Case Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert text between different case formats.
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
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(inputText.toUpperCase())}
              >
                UPPERCASE
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(inputText.toLowerCase())}
              >
                lowercase
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(toTitleCase(inputText))}
              >
                Title Case
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(toCamelCase(inputText))}
              >
                camelCase
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 8px)' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setOutputText(toSnakeCase(inputText))}
              >
                snake_case
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

export default CaseConverterPage;
