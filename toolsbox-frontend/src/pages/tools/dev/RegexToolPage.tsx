import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, FormControlLabel, Checkbox, List, ListItem, ListItemText } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const RegexToolPage: React.FC = () => {
  const [regexPattern, setRegexPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
  });
  const [matches, setMatches] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const testRegex = () => {
    if (!regexPattern || !testString) return;
    
    try {
      // Build flags string
      let flagsStr = '';
      if (flags.global) flagsStr += 'g';
      if (flags.caseInsensitive) flagsStr += 'i';
      if (flags.multiline) flagsStr += 'm';
      
      // Create regex object
      const regex = new RegExp(regexPattern, flagsStr);
      
      // Find matches
      const matchResults: string[] = [];
      let match;
      
      if (flags.global) {
        match = testString.match(regex);
        if (match) {
          matchResults.push(...match);
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matchResults.push(match[0]);
        }
      }
      
      setMatches(matchResults);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setMatches([]);
    }
  };

  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags({
      ...flags,
      [flag]: !flags[flag],
    });
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Regex Tester
        </Typography>
        <Typography variant="body1" paragraph>
          Test and debug regular expressions with real-time feedback.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Regular Expression"
            fullWidth
            value={regexPattern}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegexPattern(e.target.value)}
            error={!isValid}
            helperText={errorMessage}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.global}
                  onChange={() => handleFlagChange('global')}
                />
              }
              label="Global (g)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.caseInsensitive}
                  onChange={() => handleFlagChange('caseInsensitive')}
                />
              }
              label="Case Insensitive (i)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.multiline}
                  onChange={() => handleFlagChange('multiline')}
                />
              }
              label="Multiline (m)"
            />
          </Box>
          
          <TextField
            label="Test String"
            multiline
            rows={4}
            fullWidth
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={testRegex}
            disabled={!regexPattern || !testString}
            sx={{ mb: 3 }}
          >
            Test Regex
          </Button>
          
          <Typography variant="h6" gutterBottom>
            Matches {matches.length > 0 ? `(${matches.length})` : ''}
          </Typography>
          
          {matches.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
              {matches.map((match, index) => (
                <ListItem key={index} divider={index < matches.length - 1}>
                  <ListItemText primary={match} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No matches found.
            </Typography>
          )}
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Common Regex Patterns
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setRegexPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Email Address
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setRegexPattern('\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b')}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Phone Number (US)
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setRegexPattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Password (8+ chars, letters & numbers)
              </Button>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => setRegexPattern('https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)')}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                URL
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegexToolPage;
