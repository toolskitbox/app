import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Container, Paper, Button, LinearProgress, Divider, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  time: number;
}

const TypingTestPage: React.FC = () => {
  // Sample text passages for typing test
  const textPassages = [
    {
      title: 'Short - The Quick Brown Fox',
      text: 'The quick brown fox jumps over the lazy dog. This sentence contains all the letters in the English alphabet.'
    },
    {
      title: 'Medium - Programming',
      text: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.'
    },
    {
      title: 'Long - The Internet',
      text: 'The Internet is a global network of computers connected to each other which communicate through a standardized set of protocols. It has revolutionized the way we communicate, learn, work, and entertain ourselves. From social media platforms to online shopping, from video streaming to remote work, the Internet has become an integral part of modern life. Despite its benefits, it also presents challenges such as privacy concerns, security threats, and digital divide issues.'
    }
  ];

  const [selectedPassage, setSelectedPassage] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isTestComplete, setIsTestComplete] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [typingStats, setTypingStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    time: 0
  });
  const [testHistory, setTestHistory] = useState<TypingStats[]>([]);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up timer on component unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  useEffect(() => {
    // Calculate stats in real-time as user types
    if (isTestActive && !isTestComplete) {
      calculateStats();
    }
  }, [inputText, currentTime]);

  const startTest = () => {
    setInputText('');
    setIsTestActive(true);
    setIsTestComplete(false);
    setStartTime(Date.now());
    setCurrentTime(Date.now());
    
    // Start timer to update currentTime
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    
    setTimerInterval(interval);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const endTest = (e?: React.MouseEvent<HTMLButtonElement>) => {
    setIsTestActive(false);
    setIsTestComplete(true);
    
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Calculate final stats - pass true to skip the auto-end test check
    const finalStats = calculateStats(true);
    
    // Add to history
    setTestHistory([finalStats, ...testHistory].slice(0, 10)); // Keep only last 10 tests
  };

  const calculateStats = (skipEndTest: boolean = false): TypingStats => {
    const targetText = textPassages[selectedPassage].text;
    const elapsedTimeInMinutes = (currentTime - startTime) / 60000;
    
    let correctChars = 0;
    let incorrectChars = 0;
    
    // Compare each character
    for (let i = 0; i < inputText.length; i++) {
      if (i < targetText.length) {
        if (inputText[i] === targetText[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      } else {
        // Extra characters typed beyond the target text
        incorrectChars++;
      }
    }
    
    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
    
    // Words per minute (assuming average word length of 5 characters)
    const wpm = elapsedTimeInMinutes > 0 ? (correctChars / 5) / elapsedTimeInMinutes : 0;
    
    const stats: TypingStats = {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 100) / 100,
      correctChars,
      incorrectChars,
      totalChars,
      time: Math.round((currentTime - startTime) / 1000)
    };
    
    setTypingStats(stats);
    
    // Auto-end test if user has typed the entire passage
    // Only check this during normal calculation, not when called from endTest
    if (!skipEndTest && isTestActive && inputText.length >= targetText.length) {
      // Use setTimeout to avoid the recursive call stack issue
      setTimeout(() => endTest(), 0);
    }
    
    return stats;
  };

  const renderTargetText = () => {
    const targetText = textPassages[selectedPassage].text;
    
    if (!isTestActive && !isTestComplete) {
      return <Typography variant="body1">{targetText}</Typography>;
    }
    
    // Highlight characters based on correctness
    return (
      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: 1.8 }}>
        {targetText.split('').map((char, index) => {
          let color = 'text.primary'; // Default color
          
          if (index < inputText.length) {
            if (char === inputText[index]) {
              color = 'success.main'; // Correct character
            } else {
              color = 'error.main'; // Incorrect character
            }
          }
          
          return (
            <Box component="span" key={index} sx={{ color }}>
              {char}
            </Box>
          );
        })}
      </Typography>
    );
  };

  const renderProgress = () => {
    const targetText = textPassages[selectedPassage].text;
    const progress = (inputText.length / targetText.length) * 100;
    
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
          {Math.round(progress)}% complete
        </Typography>
      </Box>
    );
  };

  const renderStats = () => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <Box sx={{ width: { xs: '50%', sm: '25%' }, p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5">{typingStats.wpm}</Typography>
            <Typography variant="body2">WPM</Typography>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '50%', sm: '25%' }, p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5">{typingStats.accuracy}%</Typography>
            <Typography variant="body2">Accuracy</Typography>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '50%', sm: '25%' }, p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5">{typingStats.correctChars}</Typography>
            <Typography variant="body2">Correct Chars</Typography>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '50%', sm: '25%' }, p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5">{typingStats.time}s</Typography>
            <Typography variant="body2">Time</Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  const renderHistory = () => {
    if (testHistory.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No test history yet. Complete a test to see your results here.
        </Typography>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test History
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {testHistory.map((test, index) => (
            <Box sx={{ width: '100%' }} key={index}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, width: '25%' }}>
                    <Typography variant="body2" color="text.secondary">
                      WPM
                    </Typography>
                    <Typography variant="body1">
                      {test.wpm}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, width: '25%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                    <Typography variant="body1">
                      {test.accuracy}%
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, width: '25%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Chars
                    </Typography>
                    <Typography variant="body1">
                      {test.correctChars}/{test.totalChars}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, width: '25%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {test.time}s
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Typing Speed Test
        </Typography>
        <Typography variant="body1" paragraph>
          Test your typing speed and accuracy with this simple typing test.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          {!isTestActive && !isTestComplete && (
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Passage</InputLabel>
                <Select
                  value={selectedPassage}
                  label="Select Passage"
                  onChange={(event: any) => setSelectedPassage(Number(event.target.value))}
                >
                  {textPassages.map((passage, index) => (
                    <MenuItem key={index} value={index}>{passage.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={startTest}
                fullWidth
              >
                Start Typing Test
              </Button>
            </Box>
          )}
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            {renderTargetText()}
          </Box>
          
          {(isTestActive || isTestComplete) && renderProgress()}
          
          {isTestActive && (
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              rows={4}
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
              placeholder="Start typing here..."
              variant="outlined"
              sx={{ mt: 2 }}
              disabled={isTestComplete}
            />
          )}
          
          {isTestActive && !isTestComplete && (
            <Button 
              variant="contained" 
              color="error"
              onClick={endTest}
              sx={{ mt: 2 }}
            >
              End Test
            </Button>
          )}
          
          {(isTestActive || isTestComplete) && renderStats()}
          
          {isTestComplete && (
            <Button 
              variant="contained" 
              onClick={startTest}
              sx={{ mt: 3 }}
            >
              Start New Test
            </Button>
          )}
        </Paper>
        
        {renderHistory()}
      </Box>
    </Container>
  );
};

export default TypingTestPage;
