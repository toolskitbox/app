import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const Base64ConverterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionType, setConversionType] = useState('encode');
  const [error, setError] = useState('');

  const handleConvert = () => {
    if (!inputText) return;
    
    setError('');
    
    try {
      if (conversionType === 'encode') {
        // Encode to Base64
        const encoded = btoa(inputText);
        setOutputText(encoded);
      } else {
        // Decode from Base64
        const decoded = atob(inputText);
        setOutputText(decoded);
      }
    } catch (err) {
      setError(`Conversion error: ${(err as Error).message}`);
      setOutputText('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    if (conversionType === 'encode') {
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // For text files
          setInputText(result);
        } else if (result instanceof ArrayBuffer) {
          // For binary files
          const bytes = new Uint8Array(result);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          setInputText(binary);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setInputText(result);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    
    const element = document.createElement('a');
    let content, filename;
    
    if (conversionType === 'encode') {
      content = outputText;
      filename = 'encoded.txt';
    } else {
      content = outputText;
      filename = 'decoded.txt';
    }
    
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Base64 Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Encode text to Base64 or decode Base64 to text.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Conversion Type</InputLabel>
            <Select
              value={conversionType}
              label="Conversion Type"
              onChange={(e) => setConversionType(e.target.value)}
            >
              <MenuItem value="encode">Encode to Base64</MenuItem>
              <MenuItem value="decode">Decode from Base64</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Input"
            multiline
            rows={6}
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Button 
                variant="contained" 
                onClick={handleConvert}
                disabled={!inputText}
              >
                {conversionType === 'encode' ? 'Encode' : 'Decode'}
              </Button>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                component="label"
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="h6" gutterBottom>
            Output
          </Typography>
          
          <TextField
            multiline
            rows={6}
            fullWidth
            value={outputText}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2, fontFamily: 'monospace' }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Button 
                variant="outlined" 
                onClick={copyToClipboard}
                disabled={!outputText}
              >
                Copy to Clipboard
              </Button>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                onClick={downloadOutput}
                disabled={!outputText}
              >
                Download
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Base64ConverterPage;
