import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import duration from 'dayjs/plugin/duration';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

// Extend dayjs with the required plugins
dayjs.extend(dayOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isLeapYear);
dayjs.extend(duration);

const DateCalculatorPage: React.FC = () => {
  // Date Difference Calculator
  const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(dayjs().add(1, 'month').format('YYYY-MM-DD'));
  const [diffResult, setDiffResult] = useState<string>('');
  
  // Date Add/Subtract Calculator
  const [baseDate, setBaseDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [operation, setOperation] = useState<string>('add');
  const [amount, setAmount] = useState<string>('1');
  const [unit, setUnit] = useState<string>('days');
  const [addSubtractResult, setAddSubtractResult] = useState<string>('');
  
  // Day of Week/Year Calculator
  const [dayOfDate, setDayOfDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dayOfResult, setDayOfResult] = useState<string>('');

  useEffect(() => {
    calculateDateDifference();
    calculateAddSubtract();
    calculateDayOf();
  }, [startDate, endDate, baseDate, operation, amount, unit, dayOfDate]);

  const calculateDateDifference = () => {
    if (!startDate || !endDate) return;
    
    try {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      
      if (!start.isValid() || !end.isValid()) {
        setDiffResult('Invalid date(s)');
        return;
      }
      
      const diffMs = end.diff(start);
      const diffDuration = dayjs.duration(diffMs);
      
      const years = diffDuration.years();
      const months = diffDuration.months();
      const days = diffDuration.days();
      
      const totalDays = end.diff(start, 'day');
      const totalHours = end.diff(start, 'hour');
      const totalMinutes = end.diff(start, 'minute');
      
      let result = '';
      
      if (years > 0) {
        result += `${years} year${years !== 1 ? 's' : ''}, `;
      }
      
      if (months > 0 || years > 0) {
        result += `${months} month${months !== 1 ? 's' : ''}, `;
      }
      
      result += `${days} day${days !== 1 ? 's' : ''}`;
      
      result += `\n\nTotal: ${totalDays} day${totalDays !== 1 ? 's' : ''}`;
      result += `\nTotal: ${totalHours} hour${totalHours !== 1 ? 's' : ''}`;
      result += `\nTotal: ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
      
      // Include weekdays calculation
      const weekdays = countWeekdays(start, end);
      result += `\n\nWeekdays: ${weekdays} day${weekdays !== 1 ? 's' : ''}`;
      result += `\nWeekends: ${totalDays - weekdays} day${totalDays - weekdays !== 1 ? 's' : ''}`;
      
      setDiffResult(result);
    } catch (error) {
      setDiffResult('Error calculating difference');
    }
  };

  const countWeekdays = (start: dayjs.Dayjs, end: dayjs.Dayjs): number => {
    let count = 0;
    let current = start.startOf('day');
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      // 0 is Sunday, 6 is Saturday
      const day = current.day();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }
    
    return count;
  };

  const calculateAddSubtract = () => {
    if (!baseDate || !amount) return;
    
    try {
      const base = dayjs(baseDate);
      const amountNum = parseInt(amount);
      
      if (!base.isValid() || isNaN(amountNum)) {
        setAddSubtractResult('Invalid input');
        return;
      }
      
      let result: dayjs.Dayjs;
      
      if (operation === 'add') {
        result = base.add(amountNum, unit as any);
      } else {
        result = base.subtract(amountNum, unit as any);
      }
      
      setAddSubtractResult(result.format('YYYY-MM-DD (dddd)'));
    } catch (error) {
      setAddSubtractResult('Error calculating result');
    }
  };

  const calculateDayOf = () => {
    if (!dayOfDate) return;
    
    try {
      const date = dayjs(dayOfDate);
      
      if (!date.isValid()) {
        setDayOfResult('Invalid date');
        return;
      }
      
      const dayOfWeek = date.format('dddd');
      const dayOfYear = date.dayOfYear();
      const weekOfYear = date.week();
      const daysInMonth = date.daysInMonth();
      const isLeapYear = date.isLeapYear();
      
      let result = `Day of week: ${dayOfWeek}`;
      result += `\nDay of year: ${dayOfYear}`;
      result += `\nWeek of year: ${weekOfYear}`;
      result += `\nDays in month: ${daysInMonth}`;
      result += `\nLeap year: ${isLeapYear ? 'Yes' : 'No'}`;
      
      setDayOfResult(result);
    } catch (error) {
      setDayOfResult('Error calculating result');
    }
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Date Calculator
        </Typography>
        <Typography variant="body1" paragraph>
          Calculate the difference between dates, add or subtract time, and more.
        </Typography>
        
        {/* Date Difference Calculator */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Date Difference Calculator
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={calculateDateDifference}
            sx={{ mb: 2 }}
          >
            Calculate Difference
          </Button>
          
          {diffResult && (
            <TextField
              label="Result"
              multiline
              rows={6}
              fullWidth
              value={diffResult}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        </Paper>
        
        {/* Date Add/Subtract Calculator */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Date Add/Subtract Calculator
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="Base Date"
                type="date"
                fullWidth
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <FormControl fullWidth>
                <InputLabel>Operation</InputLabel>
                <Select
                  value={operation}
                  label="Operation"
                  onChange={(e) => setOperation(e.target.value)}
                >
                  <MenuItem value="add">Add</MenuItem>
                  <MenuItem value="subtract">Subtract</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unit}
                  label="Unit"
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                  <MenuItem value="years">Years</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={calculateAddSubtract}
            sx={{ mb: 2 }}
          >
            Calculate
          </Button>
          
          {addSubtractResult && (
            <TextField
              label="Result"
              fullWidth
              value={addSubtractResult}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        </Paper>
        
        {/* Day of Week/Year Calculator */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Day of Week/Year Calculator
          </Typography>
          
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={dayOfDate}
            onChange={(e) => setDayOfDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={calculateDayOf}
            sx={{ mb: 2 }}
          >
            Calculate
          </Button>
          
          {dayOfResult && (
            <TextField
              label="Result"
              multiline
              rows={5}
              fullWidth
              value={dayOfResult}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DateCalculatorPage;
