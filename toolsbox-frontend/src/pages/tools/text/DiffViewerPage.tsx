import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Grid, Button } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const DiffViewerPage: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diffResult, setDiffResult] = useState<React.ReactNode[]>([]);

  const computeDiff = () => {
    if (!originalText || !modifiedText) {
      return;
    }

    const originalLines = originalText.split('\n');
    const modifiedLines = modifiedText.split('\n');
    
    // Simple line-by-line diff
    const result: React.ReactNode[] = [];
    
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      if (originalLine === modifiedLine) {
        result.push(
          <Box key={i} sx={{ display: 'flex', mb: 1 }}>
            <Box sx={{ width: '50%', pr: 1 }}>
              <Box sx={{ p: 1, bgcolor: '#f5f5f5' }}>{originalLine}</Box>
            </Box>
            <Box sx={{ width: '50%', pl: 1 }}>
              <Box sx={{ p: 1, bgcolor: '#f5f5f5' }}>{modifiedLine}</Box>
            </Box>
          </Box>
        );
      } else {
        result.push(
          <Box key={i} sx={{ display: 'flex', mb: 1 }}>
            <Box sx={{ width: '50%', pr: 1 }}>
              <Box sx={{ p: 1, bgcolor: '#ffebee' }}>{originalLine}</Box>
            </Box>
            <Box sx={{ width: '50%', pl: 1 }}>
              <Box sx={{ p: 1, bgcolor: '#e8f5e9' }}>{modifiedLine}</Box>
            </Box>
          </Box>
        );
      }
    }
    
    setDiffResult(result);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Diff Viewer
        </Typography>
        <Typography variant="body1" paragraph>
          Compare two texts and see the differences.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
            <TextField
              label="Original Text"
              multiline
              rows={10}
              fullWidth
              value={originalText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOriginalText(e.target.value)}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
            <TextField
              label="Modified Text"
              multiline
              rows={10}
              fullWidth
              value={modifiedText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModifiedText(e.target.value)}
            />
          </Box>
        </Box>
        
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button variant="contained" onClick={computeDiff}>
            Compare Texts
          </Button>
        </Box>
        
        {diffResult.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Diff Result
            </Typography>
            <Box>
              {diffResult}
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default DiffViewerPage;
