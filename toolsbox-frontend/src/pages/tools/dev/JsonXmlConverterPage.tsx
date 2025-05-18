import React, { useState } from 'react';
import { SelectChangeEvent } from '@mui/material';
import { Box, Typography, Container, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import xmljs from 'xml-js';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const JsonXmlConverterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionType, setConversionType] = useState('jsonToXml');
  const [error, setError] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(true);

  const handleConvert = () => {
    if (!inputText) return;
    
    setError('');
    
    try {
      if (conversionType === 'jsonToXml') {
        // Convert JSON to XML
        const jsonObj = JSON.parse(inputText);
        const options = {
          compact: true,
          spaces: prettyPrint ? 2 : 0
        };
        const xmlResult = xmljs.js2xml(jsonObj, options);
        setOutputText(xmlResult);
      } else {
        // Convert XML to JSON
        const options = {
          compact: true,
          spaces: prettyPrint ? 2 : 0
        };
        const jsonResult = xmljs.xml2js(inputText, options);
        setOutputText(JSON.stringify(jsonResult, null, prettyPrint ? 2 : 0));
      }
    } catch (err) {
      setError(`Conversion error: ${(err as Error).message}`);
      setOutputText('');
    }
  };

  const handleFormatInput = () => {
    if (!inputText) return;
    
    try {
      if (conversionType === 'jsonToXml') {
        // Format JSON
        const jsonObj = JSON.parse(inputText);
        setInputText(JSON.stringify(jsonObj, null, 2));
      } else {
        // Format XML is more complex and not implemented here
        setError('XML formatting is not supported. Please provide properly formatted XML.');
      }
    } catch (err) {
      setError(`Formatting error: ${(err as Error).message}`);
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
          JSON/XML Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert between JSON and XML formats.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Conversion Type</InputLabel>
                  <Select
                    value={conversionType}
                    label="Conversion Type"
                    onChange={(e: SelectChangeEvent) => setConversionType(e.target.value)}
                  >
                    <MenuItem value="jsonToXml">JSON to XML</MenuItem>
                    <MenuItem value="xmlToJson">XML to JSON</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  onClick={handleFormatInput}
                  disabled={!inputText}
                >
                  Format Input
                </Button>
              </Box>
              
              <TextField
                label={conversionType === 'jsonToXml' ? 'JSON Input' : 'XML Input'}
                multiline
                rows={15}
                fullWidth
                value={inputText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                sx={{ mb: 2, flexGrow: 1 }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleConvert}
                disabled={!inputText}
                fullWidth
              >
                Convert
              </Button>
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {conversionType === 'jsonToXml' ? 'XML Output' : 'JSON Output'}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  onClick={copyToClipboard}
                  disabled={!outputText}
                >
                  Copy to Clipboard
                </Button>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                multiline
                rows={15}
                fullWidth
                value={outputText}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2, flexGrow: 1, fontFamily: 'monospace' }}
              />
              
              <FormControl>
                <InputLabel>Output Format</InputLabel>
                <Select
                  value={prettyPrint ? 'pretty' : 'compact'}
                  label="Output Format"
                  onChange={(e: SelectChangeEvent) => setPrettyPrint(e.target.value === 'pretty')}
                >
                  <MenuItem value="pretty">Pretty Print</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default JsonXmlConverterPage;
