import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid, FormControlLabel, Checkbox } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const SlugGeneratorPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [slug, setSlug] = useState('');
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [maxLength, setMaxLength] = useState(100);

  useEffect(() => {
    generateSlug();
  }, [inputText, lowercase, removeStopWords, maxLength]);

  const generateSlug = () => {
    if (!inputText) {
      setSlug('');
      return;
    }

    let processedText = inputText;
    
    // Convert to lowercase if option is selected
    if (lowercase) {
      processedText = processedText.toLowerCase();
    }
    
    // Remove stop words if option is selected
    if (removeStopWords) {
      const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
      processedText = processedText
        .split(' ')
        .filter(word => !stopWords.includes(word.toLowerCase()))
        .join(' ');
    }
    
    // Replace non-alphanumeric characters with hyphens
    let slugText = processedText
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Limit slug length if specified
    if (maxLength > 0 && slugText.length > maxLength) {
      // Try to cut at the last complete word
      const lastHyphen = slugText.substring(0, maxLength).lastIndexOf('-');
      if (lastHyphen > 0) {
        slugText = slugText.substring(0, lastHyphen);
      } else {
        slugText = slugText.substring(0, maxLength);
      }
    }
    
    setSlug(slugText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Slug Generator
        </Typography>
        <Typography variant="body1" paragraph>
          Generate SEO-friendly URL slugs from text.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Enter Text"
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                  />
                }
                label="Convert to lowercase"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={removeStopWords}
                    onChange={(e) => setRemoveStopWords(e.target.checked)}
                  />
                }
                label="Remove stop words"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '33.33%' }, p: 1 }}>
              <TextField
                label="Max Length"
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Generated Slug:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              value={slug}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mr: 2 }}
            />
            <Button 
              variant="outlined" 
              onClick={copyToClipboard}
              disabled={!slug}
            >
              Copy
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SlugGeneratorPage;
