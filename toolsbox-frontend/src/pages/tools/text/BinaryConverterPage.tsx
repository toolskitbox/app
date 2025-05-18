import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const BinaryConverterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionType, setConversionType] = useState('textToBinary');

  const textToBinary = (text: string) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const binaryToText = (binary: string) => {
    return binary.split(' ').map(bin => {
      return String.fromCharCode(parseInt(bin, 2));
    }).join('');
  };

  const textToHex = (text: string) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(16).padStart(2, '0');
    }).join(' ');
  };

  const hexToText = (hex: string) => {
    return hex.split(' ').map(h => {
      return String.fromCharCode(parseInt(h, 16));
    }).join('');
  };

  const handleConvert = () => {
    switch (conversionType) {
      case 'textToBinary':
        setOutputText(textToBinary(inputText));
        break;
      case 'binaryToText':
        setOutputText(binaryToText(inputText));
        break;
      case 'textToHex':
        setOutputText(textToHex(inputText));
        break;
      case 'hexToText':
        setOutputText(hexToText(inputText));
        break;
      default:
        setOutputText('');
    }
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Binary Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert text to binary/hex and vice versa.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Conversion Type</InputLabel>
            <Select
              value={conversionType}
              label="Conversion Type"
              onChange={(e: SelectChangeEvent) => setConversionType(e.target.value)}
            >
              <MenuItem value="textToBinary">Text to Binary</MenuItem>
              <MenuItem value="binaryToText">Binary to Text</MenuItem>
              <MenuItem value="textToHex">Text to Hexadecimal</MenuItem>
              <MenuItem value="hexToText">Hexadecimal to Text</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Input"
            multiline
            rows={4}
            fullWidth
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleConvert}
            >
              Convert
            </Button>
          </Box>
          
          <TextField
            label="Output"
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

export default BinaryConverterPage;
