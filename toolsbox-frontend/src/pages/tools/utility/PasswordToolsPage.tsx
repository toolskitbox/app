import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid, FormControlLabel, Checkbox, Slider, Alert } from '@mui/material';
import CryptoJS from 'crypto-js';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const PasswordToolsPage: React.FC = () => {
  // Password Generator State
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  
  // Password Strength Checker State
  const [passwordToCheck, setPasswordToCheck] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string }>({ score: 0, feedback: '' });
  
  // Password Hasher State
  const [passwordToHash, setPasswordToHash] = useState<string>('');
  const [hashType, setHashType] = useState<string>('md5');
  const [hashedPassword, setHashedPassword] = useState<string>('');

  const generatePassword = () => {
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      setGeneratedPassword('Please select at least one character type');
      return;
    }

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let allChars = '';
    if (includeUppercase) allChars += uppercaseChars;
    if (includeLowercase) allChars += lowercaseChars;
    if (includeNumbers) allChars += numberChars;
    if (includeSymbols) allChars += symbolChars;
    
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }
    
    // Ensure at least one character from each selected type
    let finalPassword = password;
    if (includeUppercase && !/[A-Z]/.test(finalPassword)) {
      const randomChar = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
      const randomPos = Math.floor(Math.random() * finalPassword.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    
    if (includeLowercase && !/[a-z]/.test(finalPassword)) {
      const randomChar = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
      const randomPos = Math.floor(Math.random() * finalPassword.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    
    if (includeNumbers && !/[0-9]/.test(finalPassword)) {
      const randomChar = numberChars[Math.floor(Math.random() * numberChars.length)];
      const randomPos = Math.floor(Math.random() * finalPassword.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    
    if (includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(finalPassword)) {
      const randomChar = symbolChars[Math.floor(Math.random() * symbolChars.length)];
      const randomPos = Math.floor(Math.random() * finalPassword.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    
    setGeneratedPassword(finalPassword);
  };

  const checkPasswordStrength = () => {
    if (!passwordToCheck) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }
    
    let score = 0;
    let feedback = '';
    
    // Length check
    if (passwordToCheck.length < 8) {
      feedback = 'Password is too short';
      score = 1;
    } else if (passwordToCheck.length < 10) {
      score = 2;
    } else if (passwordToCheck.length < 12) {
      score = 3;
    } else {
      score = 4;
    }
    
    // Character variety check
    const hasUppercase = /[A-Z]/.test(passwordToCheck);
    const hasLowercase = /[a-z]/.test(passwordToCheck);
    const hasNumbers = /[0-9]/.test(passwordToCheck);
    const hasSymbols = /[^A-Za-z0-9]/.test(passwordToCheck);
    
    const varietyScore = (hasUppercase ? 1 : 0) + (hasLowercase ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSymbols ? 1 : 0);
    
    if (varietyScore < 2) {
      feedback = 'Add more types of characters (uppercase, lowercase, numbers, symbols)';
      score = Math.min(score, 1);
    } else if (varietyScore < 3) {
      if (!feedback) feedback = 'Add more variety of characters';
      score = Math.min(score, 2);
    } else if (varietyScore < 4) {
      score = Math.min(score, 3);
    }
    
    // Common patterns check
    const hasRepeatedChars = /(.)\1{2,}/.test(passwordToCheck);
    const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(passwordToCheck);
    
    if (hasRepeatedChars || hasSequentialChars) {
      feedback = 'Avoid repeated or sequential characters';
      score = Math.min(score, 2);
    }
    
    // Common words check
    const commonWords = ['password', 'admin', '123456', 'qwerty', 'welcome', 'letmein'];
    const hasCommonWord = commonWords.some(word => passwordToCheck.toLowerCase().includes(word));
    
    if (hasCommonWord) {
      feedback = 'Avoid common words or patterns';
      score = 1;
    }
    
    // Final feedback
    if (score === 4 && !feedback) {
      feedback = 'Excellent password!';
    } else if (score === 3 && !feedback) {
      feedback = 'Good password, but could be stronger';
    } else if (score === 2 && !feedback) {
      feedback = 'Moderate password, consider improving';
    } else if (score === 1 && !feedback) {
      feedback = 'Weak password, needs improvement';
    }
    
    setPasswordStrength({ score, feedback });
  };

  const hashPassword = () => {
    if (!passwordToHash) return;
    
    let hash = '';
    
    switch (hashType) {
      case 'md5':
        hash = CryptoJS.MD5(passwordToHash).toString();
        break;
      case 'sha1':
        hash = CryptoJS.SHA1(passwordToHash).toString();
        break;
      case 'sha256':
        hash = CryptoJS.SHA256(passwordToHash).toString();
        break;
      case 'sha512':
        hash = CryptoJS.SHA512(passwordToHash).toString();
        break;
      default:
        hash = CryptoJS.MD5(passwordToHash).toString();
    }
    
    setHashedPassword(hash);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Password Tools
        </Typography>
        <Typography variant="body1" paragraph>
          Generate strong passwords, check password strength, and hash passwords.
        </Typography>
        
        {/* Password Generator */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Password Generator
          </Typography>
          
          <Typography gutterBottom>Password Length: {passwordLength}</Typography>
          <Slider
            value={passwordLength}
            onChange={(_, newValue) => setPasswordLength(newValue as number)}
            min={6}
            max={32}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                  />
                }
                label="Include Uppercase Letters"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                  />
                }
                label="Include Lowercase Letters"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                }
                label="Include Numbers"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '45%' } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                }
                label="Include Symbols"
              />
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={generatePassword}
            sx={{ mb: 2 }}
          >
            Generate Password
          </Button>
          
          {generatedPassword && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  value={generatedPassword}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => copyToClipboard(generatedPassword)}
                >
                  Copy
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* Password Strength Checker */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Password Strength Checker
          </Typography>
          
          <TextField
            label="Enter Password to Check"
            fullWidth
            type="password"
            value={passwordToCheck}
            onChange={(e) => setPasswordToCheck(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={checkPasswordStrength}
            sx={{ mb: 2 }}
          >
            Check Strength
          </Button>
          
          {passwordToCheck && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Strength: {
                  passwordStrength.score === 0 ? 'Not Checked' :
                  passwordStrength.score === 1 ? 'Weak' :
                  passwordStrength.score === 2 ? 'Moderate' :
                  passwordStrength.score === 3 ? 'Good' : 'Strong'
                }
              </Typography>
              
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'grey.300',
                  position: 'relative'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    borderRadius: 5,
                    position: 'absolute',
                    width: `${passwordStrength.score * 25}%`,
                    bgcolor: 
                      passwordStrength.score === 0 ? 'grey.500' :
                      passwordStrength.score === 1 ? 'error.main' :
                      passwordStrength.score === 2 ? 'warning.main' :
                      passwordStrength.score === 3 ? 'info.main' : 'success.main'
                  }} />
                </Box>
              </Box>
              
              {passwordStrength.feedback && (
                <Alert severity={
                  passwordStrength.score <= 1 ? 'error' :
                  passwordStrength.score === 2 ? 'warning' :
                  passwordStrength.score === 3 ? 'info' : 'success'
                }>
                  {passwordStrength.feedback}
                </Alert>
              )}
            </Box>
          )}
        </Paper>
        
        {/* Password Hasher */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Password Hasher
          </Typography>
          
          <TextField
            label="Enter Password to Hash"
            fullWidth
            value={passwordToHash}
            onChange={(e) => setPasswordToHash(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Button 
                variant={hashType === 'md5' ? 'contained' : 'outlined'}
                onClick={() => setHashType('md5')}
              >
                MD5
              </Button>
            </Box>
            <Box>
              <Button 
                variant={hashType === 'sha1' ? 'contained' : 'outlined'}
                onClick={() => setHashType('sha1')}
              >
                SHA-1
              </Button>
            </Box>
            <Box>
              <Button 
                variant={hashType === 'sha256' ? 'contained' : 'outlined'}
                onClick={() => setHashType('sha256')}
              >
                SHA-256
              </Button>
            </Box>
            <Box>
              <Button 
                variant={hashType === 'sha512' ? 'contained' : 'outlined'}
                onClick={() => setHashType('sha512')}
              >
                SHA-512
              </Button>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={hashPassword}
            sx={{ mb: 2 }}
          >
            Hash Password
          </Button>
          
          {hashedPassword && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {hashType.toUpperCase()} Hash:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={hashedPassword}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => copyToClipboard(hashedPassword)}
                >
                  Copy
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordToolsPage;
