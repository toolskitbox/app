import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Divider } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const MetaTagGeneratorPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    generateMetaTags();
  }, [title, description, keywords, author, url, image]);

  const generateMetaTags = () => {
    let code = '';
    
    if (title) {
      code += `<title>${title}</title>\n`;
      code += `<meta name="title" content="${title}">\n`;
    }
    
    if (description) {
      code += `<meta name="description" content="${description}">\n`;
    }
    
    if (keywords) {
      code += `<meta name="keywords" content="${keywords}">\n`;
    }
    
    if (author) {
      code += `<meta name="author" content="${author}">\n`;
    }
    
    // Open Graph / Facebook
    if (title || description || url || image) {
      code += '\n<!-- Open Graph / Facebook -->\n';
      code += '<meta property="og:type" content="website">\n';
      
      if (url) {
        code += `<meta property="og:url" content="${url}">\n`;
      }
      
      if (title) {
        code += `<meta property="og:title" content="${title}">\n`;
      }
      
      if (description) {
        code += `<meta property="og:description" content="${description}">\n`;
      }
      
      if (image) {
        code += `<meta property="og:image" content="${image}">\n`;
      }
    }
    
    // Twitter
    if (title || description || image) {
      code += '\n<!-- Twitter -->\n';
      code += '<meta property="twitter:card" content="summary_large_image">\n';
      
      if (url) {
        code += `<meta property="twitter:url" content="${url}">\n`;
      }
      
      if (title) {
        code += `<meta property="twitter:title" content="${title}">\n`;
      }
      
      if (description) {
        code += `<meta property="twitter:description" content="${description}">\n`;
      }
      
      if (image) {
        code += `<meta property="twitter:image" content="${image}">\n`;
      }
    }
    
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meta Tag Generator
        </Typography>
        <Typography variant="body1" paragraph>
          Generate meta tags for your website to improve SEO and social sharing.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                label="Keywords (comma separated)"
                fullWidth
                value={keywords}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Author"
                  fullWidth
                  value={author}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Canonical URL"
                  fullWidth
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                />
              </Box>
            </Box>
            <Box>
              <TextField
                label="Image URL (for social sharing)"
                fullWidth
                value={image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.value)}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Generated Meta Tags
          </Typography>
          
          <TextField
            multiline
            rows={10}
            fullWidth
            value={generatedCode}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2, fontFamily: 'monospace' }}
          />
          
          <Button 
            variant="contained" 
            onClick={copyToClipboard}
          >
            Copy to Clipboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default MetaTagGeneratorPage;
