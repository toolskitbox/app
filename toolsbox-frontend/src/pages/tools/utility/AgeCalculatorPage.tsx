import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Divider } from '@mui/material';
import dayjs from 'dayjs';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const AgeCalculatorPage: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('');
  const [secondDate, setSecondDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [ageResult, setAgeResult] = useState<string>('');
  const [nextBirthdayResult, setNextBirthdayResult] = useState<string>('');

  useEffect(() => {
    if (birthDate) {
      calculateAge();
      calculateNextBirthday();
    }
  }, [birthDate, secondDate]);

  const calculateAge = () => {
    if (!birthDate) return;
    
    try {
      const birth = dayjs(birthDate);
      const end = secondDate ? dayjs(secondDate) : dayjs();
      
      if (!birth.isValid() || !end.isValid()) {
        setAgeResult('Invalid date(s)');
        return;
      }
      
      if (birth.isAfter(end)) {
        setAgeResult('Birth date cannot be in the future');
        return;
      }
      
      const years = end.diff(birth, 'year');
      const months = end.diff(birth.add(years, 'year'), 'month');
      const days = end.diff(birth.add(years, 'year').add(months, 'month'), 'day');
      
      const totalMonths = end.diff(birth, 'month');
      const totalDays = end.diff(birth, 'day');
      const totalHours = end.diff(birth, 'hour');
      
      let result = `${years} years, ${months} months, ${days} days`;
      result += `\n\nTotal: ${totalMonths} months`;
      result += `\nTotal: ${totalDays} days`;
      result += `\nTotal: ${totalHours} hours`;
      
      setAgeResult(result);
    } catch (error) {
      setAgeResult('Error calculating age');
    }
  };

  const calculateNextBirthday = () => {
    if (!birthDate) return;
    
    try {
      const birth = dayjs(birthDate);
      const today = dayjs();
      
      if (!birth.isValid()) {
        setNextBirthdayResult('Invalid birth date');
        return;
      }
      
      // Calculate next birthday
      let nextBirthday = dayjs(today).set('month', birth.month()).set('date', birth.date());
      if (nextBirthday.isBefore(today)) {
        nextBirthday = nextBirthday.add(1, 'year');
      }
      
      const daysUntilBirthday = nextBirthday.diff(today, 'day');
      const nextAge = nextBirthday.diff(birth, 'year');
      
      let result = `Next birthday: ${nextBirthday.format('YYYY-MM-DD (dddd)')}`;
      result += `\nDays until next birthday: ${daysUntilBirthday}`;
      result += `\nYou will be ${nextAge} years old`;
      
      setNextBirthdayResult(result);
    } catch (error) {
      setNextBirthdayResult('Error calculating next birthday');
    }
  };

  const calculateLifeStats = () => {
    if (!birthDate) return null;
    
    try {
      const birth = dayjs(birthDate);
      const today = dayjs();
      
      if (!birth.isValid() || birth.isAfter(today)) {
        return null;
      }
      
      const ageInYears = today.diff(birth, 'year');
      
      // Assuming average life expectancy of 80 years
      const lifeExpectancy = 80;
      const yearsLeft = lifeExpectancy - ageInYears;
      const percentageLived = (ageInYears / lifeExpectancy) * 100;
      
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Life Statistics
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Based on average life expectancy of {lifeExpectancy} years:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '31%' } }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5">{ageInYears}</Typography>
                <Typography variant="body2">Years lived</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '31%' } }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5">{yearsLeft > 0 ? yearsLeft : 0}</Typography>
                <Typography variant="body2">Years remaining</Typography>
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '31%' } }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5">{percentageLived.toFixed(1)}%</Typography>
                <Typography variant="body2">Life completed</Typography>
              </Paper>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, width: '100%', height: 20, bgcolor: 'grey.300', borderRadius: 1, position: 'relative' }}>
            <Box sx={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              height: '100%', 
              width: `${percentageLived > 100 ? 100 : percentageLived}%`,
              bgcolor: percentageLived > 80 ? 'error.main' : 'primary.main',
              borderRadius: 1
            }} />
          </Box>
        </Box>
      );
    } catch (error) {
      return null;
    }
  };

  const calculateZodiacSign = () => {
    if (!birthDate) return null;
    
    try {
      const birth = dayjs(birthDate);
      
      if (!birth.isValid()) {
        return null;
      }
      
      const month = birth.month() + 1; // dayjs months are 0-indexed
      const day = birth.date();
      
      let zodiacSign = '';
      let dateRange = '';
      
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
        zodiacSign = 'Aries';
        dateRange = 'March 21 - April 19';
      } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
        zodiacSign = 'Taurus';
        dateRange = 'April 20 - May 20';
      } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
        zodiacSign = 'Gemini';
        dateRange = 'May 21 - June 20';
      } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
        zodiacSign = 'Cancer';
        dateRange = 'June 21 - July 22';
      } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
        zodiacSign = 'Leo';
        dateRange = 'July 23 - August 22';
      } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
        zodiacSign = 'Virgo';
        dateRange = 'August 23 - September 22';
      } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
        zodiacSign = 'Libra';
        dateRange = 'September 23 - October 22';
      } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
        zodiacSign = 'Scorpio';
        dateRange = 'October 23 - November 21';
      } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
        zodiacSign = 'Sagittarius';
        dateRange = 'November 22 - December 21';
      } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        zodiacSign = 'Capricorn';
        dateRange = 'December 22 - January 19';
      } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
        zodiacSign = 'Aquarius';
        dateRange = 'January 20 - February 18';
      } else {
        zodiacSign = 'Pisces';
        dateRange = 'February 19 - March 20';
      }
      
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Zodiac Sign
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5">{zodiacSign}</Typography>
            <Typography variant="body2">{dateRange}</Typography>
          </Paper>
        </Box>
      );
    } catch (error) {
      return null;
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Age Calculator
        </Typography>
        <Typography variant="body1" paragraph>
          Calculate your exact age and find out when your next birthday is.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="Birth Date"
                type="date"
                fullWidth
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="Second Date (default: today)"
                type="date"
                fullWidth
                value={secondDate}
                onChange={(e) => setSecondDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => {
              calculateAge();
              calculateNextBirthday();
            }}
            sx={{ mb: 3 }}
          >
            Calculate Age
          </Button>
          
          {ageResult && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Age Result
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={ageResult}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {nextBirthdayResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Next Birthday
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                value={nextBirthdayResult}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
          )}
          
          {calculateLifeStats()}
          
          {calculateZodiacSign()}
        </Paper>
      </Box>
    </Container>
  );
};

export default AgeCalculatorPage;
