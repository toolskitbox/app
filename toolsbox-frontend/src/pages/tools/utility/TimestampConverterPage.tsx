import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const TimestampConverterPage: React.FC = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>('');
  const [inputTime, setInputTime] = useState<string>('');
  const [timestampResult, setTimestampResult] = useState<string>('');
  const [dateTimeResult, setDateTimeResult] = useState<string>('');
  const [timestampUnit, setTimestampUnit] = useState<string>('seconds');

  useEffect(() => {
    // Update current timestamp every second
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set default date and time to current
    const now = new Date();
    setInputDate(now.toISOString().split('T')[0]);
    setInputTime(now.toTimeString().split(' ')[0]);
  }, []);

  const convertToTimestamp = () => {
    if (!inputDate) return;
    
    try {
      const dateObj = new Date(`${inputDate}T${inputTime || '00:00:00'}`);
      
      if (isNaN(dateObj.getTime())) {
        setTimestampResult('Invalid date/time');
        return;
      }
      
      let timestamp: number;
      
      if (timestampUnit === 'seconds') {
        timestamp = Math.floor(dateObj.getTime() / 1000);
      } else if (timestampUnit === 'milliseconds') {
        timestamp = dateObj.getTime();
      } else {
        timestamp = Math.floor(dateObj.getTime() / 1000);
      }
      
      setTimestampResult(timestamp.toString());
    } catch (error) {
      setTimestampResult('Error converting to timestamp');
    }
  };

  const convertToDateTime = () => {
    if (!inputTimestamp) return;
    
    try {
      const timestamp = parseInt(inputTimestamp);
      
      if (isNaN(timestamp)) {
        setDateTimeResult('Invalid timestamp');
        return;
      }
      
      let date: Date;
      
      if (timestampUnit === 'seconds') {
        date = new Date(timestamp * 1000);
      } else if (timestampUnit === 'milliseconds') {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp * 1000);
      }
      
      if (isNaN(date.getTime())) {
        setDateTimeResult('Invalid timestamp');
        return;
      }
      
      const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      const utcDate = dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss UTC');
      const relativeTime = getRelativeTime(date);
      
      setDateTimeResult(`
Local: ${formattedDate}
UTC: ${utcDate}
Relative: ${relativeTime}
      `.trim());
    } catch (error) {
      setDateTimeResult('Error converting to date/time');
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 0) {
      return 'In the future';
    } else if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Timestamp Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert between timestamps and human-readable dates.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Timestamp
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                value={currentTimestamp}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => copyToClipboard(currentTimestamp.toString())}
              >
                Copy
              </Button>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Date/Time to Timestamp */}
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Date/Time to Timestamp
              </Typography>
              
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Timestamp Unit</InputLabel>
                <Select
                  value={timestampUnit}
                  label="Timestamp Unit"
                  onChange={(e) => setTimestampUnit(e.target.value)}
                >
                  <MenuItem value="seconds">Seconds</MenuItem>
                  <MenuItem value="milliseconds">Milliseconds</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={convertToTimestamp}
                sx={{ mb: 2 }}
              >
                Convert to Timestamp
              </Button>
              
              {timestampResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Result:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      value={timestampResult}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mr: 2 }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={() => copyToClipboard(timestampResult)}
                    >
                      Copy
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
          
          {/* Timestamp to Date/Time */}
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Timestamp to Date/Time
              </Typography>
              
              <TextField
                label="Timestamp"
                fullWidth
                value={inputTimestamp}
                onChange={(e) => setInputTimestamp(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Timestamp Unit</InputLabel>
                <Select
                  value={timestampUnit}
                  label="Timestamp Unit"
                  onChange={(e) => setTimestampUnit(e.target.value)}
                >
                  <MenuItem value="seconds">Seconds</MenuItem>
                  <MenuItem value="milliseconds">Milliseconds</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={convertToDateTime}
                sx={{ mb: 2 }}
              >
                Convert to Date/Time
              </Button>
              
              {dateTimeResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Result:
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    value={dateTimeResult}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ mb: 2 }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => copyToClipboard(dateTimeResult)}
                  >
                    Copy
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TimestampConverterPage;
