import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Autocomplete } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import { TimeZone, allTimeZones, timeZonesByRegion } from '../../../data/timezones';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TimeZoneConverterPage: React.FC = () => {
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState<string>(dayjs().format('HH:mm'));
  const [sourceTimeZone, setSourceTimeZone] = useState<string>('UTC'); // Default to UTC which is always available
  // Only use timezone values from our popularTimeZones array for initial state
  const [targetTimeZones, setTargetTimeZones] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [conversionResults, setConversionResults] = useState<{ timeZone: string; dateTime: string; offset: string }[]>([]);
  // We don't need selectedRegion anymore since we're using Autocomplete with search
  
  // Popular timezones for quick access
  const popularTimeZones: TimeZone[] = [
    { name: 'UTC', offset: '+00:00', value: 'UTC' },
    { name: 'Los Angeles (US Pacific)', offset: '-08:00/-07:00', value: 'America/Los_Angeles' },
    { name: 'Denver (US Mountain)', offset: '-07:00/-06:00', value: 'America/Denver' },
    { name: 'Chicago (US Central)', offset: '-06:00/-05:00', value: 'America/Chicago' },
    { name: 'New York (US Eastern)', offset: '-05:00/-04:00', value: 'America/New_York' },
    { name: 'London (UK)', offset: '+00:00/+01:00', value: 'Europe/London' },
    { name: 'Paris (France)', offset: '+01:00/+02:00', value: 'Europe/Paris' },
    { name: 'Berlin (Germany)', offset: '+01:00/+02:00', value: 'Europe/Berlin' },
    { name: 'Moscow (Russia)', offset: '+03:00', value: 'Europe/Moscow' },
    { name: 'Dubai (UAE)', offset: '+04:00', value: 'Asia/Dubai' },
    { name: 'Mumbai (India)', offset: '+05:30', value: 'Asia/Kolkata' },
    { name: 'Singapore', offset: '+08:00', value: 'Asia/Singapore' },
    { name: 'Tokyo (Japan)', offset: '+09:00', value: 'Asia/Tokyo' },
    { name: 'Sydney (Australia)', offset: '+10:00/+11:00', value: 'Australia/Sydney' },
    { name: 'Auckland (New Zealand)', offset: '+12:00/+13:00', value: 'Pacific/Auckland' }
  ];

  useEffect(() => {
    // Try to detect user's time zone
    try {
      const userTimeZone = dayjs.tz.guess();
      if (userTimeZone) {
        // Check if the timezone is in our complete list
        const isAvailable = allTimeZones.some(tz => tz.value === userTimeZone);
        // Set the timezone if it's in our available list, otherwise default to UTC
        setSourceTimeZone(isAvailable ? userTimeZone : 'UTC');
      }
    } catch (error) {
      console.error('Failed to detect time zone:', error);
    }
  }, []);

  useEffect(() => {
    // Convert time when inputs change
    convertTime();
  }, [date, time, sourceTimeZone, targetTimeZones]);
  
  // Validate that targetTimeZones only contains available values
  useEffect(() => {
    // Filter out any timezone that's not in our available options
    const validTimeZones = targetTimeZones.filter(tz => 
      allTimeZones.some(availableTz => availableTz.value === tz)
    );
    
    // If the filtered array is different from the current one, update it
    if (validTimeZones.length !== targetTimeZones.length) {
      setTargetTimeZones(validTimeZones.length > 0 ? validTimeZones : ['UTC']);
    }
  }, [targetTimeZones]);

  const convertTime = () => {
    if (!date || !time) return;
    
    try {
      const sourceDateTime = dayjs.tz(`${date}T${time}`, sourceTimeZone);
      
      if (!sourceDateTime.isValid()) {
        console.error('Invalid date/time');
        return;
      }
      
      const results = targetTimeZones.map((tz: string) => {
        const targetDateTime = sourceDateTime.tz(tz);
        const offset = getTimezoneOffset(tz);
        
        return {
          timeZone: tz,
          dateTime: targetDateTime.format('YYYY-MM-DD HH:mm:ss'),
          offset
        };
      });
      
      setConversionResults(results);
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  const getTimezoneOffset = (tz: string): string => {
    try {
      const now = dayjs().tz(tz);
      const offsetMinutes = now.utcOffset();
      const hours = Math.abs(Math.floor(offsetMinutes / 60));
      const minutes = Math.abs(offsetMinutes % 60);
      const sign = offsetMinutes >= 0 ? '+' : '-';
      
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getTimeZoneName = (tz: string): string => {
    // First check in popular timezones for better performance
    let timeZone = popularTimeZones.find((t: TimeZone) => t.value === tz);
    
    // If not found in popular, check in all timezones
    if (!timeZone) {
      timeZone = allTimeZones.find((t: TimeZone) => t.value === tz);
    }
    
    return timeZone ? timeZone.name : tz.replace(/_/g, ' ');
  };

  const handleAddTimeZone = (tz: string) => {
    if (!targetTimeZones.includes(tz)) {
      setTargetTimeZones([...targetTimeZones, tz]);
    }
  };

  const handleRemoveTimeZone = (tz: string) => {
    setTargetTimeZones(targetTimeZones.filter((t: string) => t !== tz));
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Time Zone Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert times between different time zones.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={time}
                onChange={(e) => setTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
              <Autocomplete
                value={allTimeZones.find(tz => tz.value === sourceTimeZone) || undefined}
                onChange={(_: React.SyntheticEvent, newValue: TimeZone | null) => {
                  if (newValue) {
                    setSourceTimeZone(newValue.value);
                  }
                }}
                options={allTimeZones}
                groupBy={(option: TimeZone) => {
                  // Find which region this timezone belongs to
                  for (const [region, zones] of Object.entries(timeZonesByRegion)) {
                    if (zones.some(tz => tz.value === option.value)) {
                      return region;
                    }
                  }
                  return 'Other';
                }}
                getOptionLabel={(option: TimeZone) => `${option.name} (${option.offset})`}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Source Time Zone"
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option: TimeZone, value: TimeZone) => option.value === value.value}
                disableClearable
              />
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Target Time Zones
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                value={null}
                onChange={(_: React.SyntheticEvent, newValue: TimeZone | null) => {
                  if (newValue) {
                    handleAddTimeZone(newValue.value);
                  }
                }}
                options={allTimeZones.filter(tz => !targetTimeZones.includes(tz.value))}
                groupBy={(option: TimeZone) => {
                  // Find which region this timezone belongs to
                  for (const [region, zones] of Object.entries(timeZonesByRegion)) {
                    if (zones.some(tz => tz.value === option.value)) {
                      return region;
                    }
                  }
                  return 'Other';
                }}
                getOptionLabel={(option: TimeZone) => `${option.name} (${option.offset})`}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Add Time Zone"
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option: TimeZone, value: TimeZone) => option.value === value.value}
              />
            </Box>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time Zone</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Offset</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conversionResults.map((result) => (
                  <TableRow key={result.timeZone}>
                    <TableCell>{getTimeZoneName(result.timeZone)}</TableCell>
                    <TableCell>{result.dateTime}</TableCell>
                    <TableCell>{result.offset}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveTimeZone(result.timeZone)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {conversionResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No time zones added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Times Around the World
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>City</TableCell>
                  <TableCell>Current Time</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  'America/Los_Angeles',
                  'America/New_York',
                  'Europe/London',
                  'Europe/Paris',
                  'Asia/Dubai',
                  'Asia/Tokyo',
                  'Australia/Sydney'
                ].map((tz) => {
                  const now = dayjs().tz(tz);
                  return (
                    <TableRow key={tz}>
                      <TableCell>{getTimeZoneName(tz)}</TableCell>
                      <TableCell>{now.format('HH:mm:ss')}</TableCell>
                      <TableCell>{now.format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default TimeZoneConverterPage;
