import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';
import BreadcrumbTrail from '../../components/common/BreadcrumbTrail';
// Import icons
import CalculateIcon from '@mui/icons-material/Calculate';
import PasswordIcon from '@mui/icons-material/Password';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';
import ScheduleIcon from '@mui/icons-material/Schedule';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const UtilityToolsPage: React.FC = () => {
  // Define all utility tools
  const utilityTools = [
    {
      name: 'Unit Converter',
      path: '/tools/utility/unit-converter',
      description: 'Convert between different units of measurement',
      icon: <CalculateIcon />
    },
    {
      name: 'Password Tools',
      path: '/tools/utility/password-tools',
      description: 'Generate and check the strength of passwords',
      icon: <PasswordIcon />
    },
    {
      name: 'Date Calculator',
      path: '/tools/utility/date-calculator',
      description: 'Calculate differences between dates and add/subtract time',
      icon: <DateRangeIcon />
    },
    {
      name: 'Age Calculator',
      path: '/tools/utility/age-calculator',
      description: 'Calculate exact age from birth date to current date',
      icon: <AccessTimeIcon />
    },
    {
      name: 'Time Zone Converter',
      path: '/tools/utility/timezone-converter',
      description: 'Convert times between different time zones',
      icon: <PublicIcon />
    },
    {
      name: 'Timestamp Converter',
      path: '/tools/utility/timestamp-converter',
      description: 'Convert between human-readable dates and Unix timestamps',
      icon: <ScheduleIcon />
    },
    {
      name: 'Typing Test',
      path: '/tools/utility/typing-test',
      description: 'Test your typing speed and accuracy',
      icon: <KeyboardIcon />
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Utility Tools
        </Typography>
        <Typography variant="body1" paragraph>
          A collection of useful utility tools for everyday tasks.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {utilityTools.map((tool, index) => (
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  component={Link} 
                  to={tool.path}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <CardContent sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: 'primary.main', mr: 1, display: 'flex' }}>
                        {tool.icon}
                      </Box>
                      <Typography variant="h6">{tool.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default UtilityToolsPage;
