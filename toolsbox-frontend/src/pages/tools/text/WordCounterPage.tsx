import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Grid } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const WordCounterPage: React.FC = () => {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [charNoSpacesCount, setCharNoSpacesCount] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);

  useEffect(() => {
    // Count words
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    setWordCount(words.length);
    
    // Count characters
    setCharCount(text.length);
    
    // Count characters without spaces
    setCharNoSpacesCount(text.replace(/\s+/g, '').length);
    
    // Count sentences
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    setSentenceCount(sentences.length);
    
    // Count paragraphs
    const paragraphs = text.split(/\n+/).filter(Boolean);
    setParagraphCount(paragraphs.length);
  }, [text]);

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Word Counter
        </Typography>
        <Typography variant="body1" paragraph>
          Count words, characters, sentences, and paragraphs in your text.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Enter your text"
            multiline
            rows={8}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{wordCount}</Typography>
                <Typography variant="body2">Words</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{charCount}</Typography>
                <Typography variant="body2">Characters</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{charNoSpacesCount}</Typography>
                <Typography variant="body2">Characters (no spaces)</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{sentenceCount}</Typography>
                <Typography variant="body2">Sentences</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{paragraphCount}</Typography>
                <Typography variant="body2">Paragraphs</Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default WordCounterPage;
