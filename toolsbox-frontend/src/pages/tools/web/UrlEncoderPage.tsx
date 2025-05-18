import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const UrlEncoderPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operation, setOperation] = useState('encode');

  const handleEncodeDecode = () => {
    if (!inputText) return;
    
    try {
      if (operation === 'encode') {
        setOutputText(encodeURIComponent(inputText));
      } else {
        setOutputText(decodeURIComponent(inputText));
      }
    } catch (error) {
      setOutputText('Error: Invalid input for the selected operation');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          URL Encoder/Decoder
        </Typography>
        <Typography variant="body1" paragraph>
          Encode or decode URLs for safe transmission over the internet.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Operation</InputLabel>
            <Select
              value={operation}
              label="Operation"
              onChange={(e) => setOperation(e.target.value)}
            >
              <MenuItem value="encode">Encode</MenuItem>
              <MenuItem value="decode">Decode</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label={operation === 'encode' ? 'Text to Encode' : 'Text to Decode'}
            multiline
            rows={4}
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ p: 1 }}>
              <Button 
                variant="contained" 
                onClick={handleEncodeDecode}
              >
                {operation === 'encode' ? 'Encode' : 'Decode'}
              </Button>
            </Box>
          </Box>
          
          <TextField
            label="Result"
            multiline
            rows={4}
            fullWidth
            value={outputText}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          
          {outputText && (
            <Button 
              variant="outlined" 
              onClick={copyToClipboard}
            >
              Copy to Clipboard
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UrlEncoderPage;
