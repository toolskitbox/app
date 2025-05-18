import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardActionArea, useTheme, alpha } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  TextFields as TextFieldsIcon,
  Transform as TransformIcon,
  Description as DescriptionIcon,
  FormatSize as FormatSizeIcon,
  Compare as CompareIcon,
  Code as CodeIcon,
  FormatColorText as FormatColorTextIcon
} from '@mui/icons-material';
import BreadcrumbTrail from '../../components/common/BreadcrumbTrail';

const TextToolsPage: React.FC = () => {
  const theme = useTheme();
  
  // Define all text tools
  const textTools = [
    {
      id: 1,
      name: 'Text Formatter',
      path: '/tools/text/text-formatter',
      description: 'Format and beautify your text with various options',
      icon: <FormatColorTextIcon />,
      color: theme.palette.primary.main
    },
    {
      id: 2,
      name: 'File Converter',
      path: '/tools/text/file-converter',
      description: 'Convert between different document formats',
      icon: <DescriptionIcon />,
      color: theme.palette.secondary.main
    },
    {
      id: 3,
      name: 'String Tools',
      path: '/tools/text/string-tools',
      description: 'Manipulate and transform text strings',
      icon: <TextFieldsIcon />,
      color: '#3f51b5'
    },
    {
      id: 4,
      name: 'Case Converter',
      path: '/tools/text/case-converter',
      description: 'Convert text between different letter cases',
      icon: <FormatSizeIcon />,
      color: '#f50057'
    },
    {
      id: 5,
      name: 'Word Counter',
      path: '/tools/text/word-counter',
      description: 'Count words, characters, and analyze text',
      icon: <TextFieldsIcon />,
      color: '#2196f3'
    },
    {
      id: 6,
      name: 'Diff Viewer',
      path: '/tools/text/diff-viewer',
      description: 'Compare text and find differences',
      icon: <CompareIcon />,
      color: '#ff9800'
    },
    {
      id: 7,
      name: 'Binary Converter',
      path: '/tools/text/binary-converter',
      description: 'Convert between text and binary formats',
      icon: <CodeIcon />,
      color: '#4caf50'
    },
    {
      id: 8,
      name: 'Stylish Text',
      path: '/tools/text/stylish-text',
      description: 'Create fancy and stylish text for social media',
      icon: <FormatColorTextIcon />,
      color: '#9c27b0'
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Fancy Breadcrumbs */}
        <BreadcrumbTrail />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Text Tools
        </Typography>
        <Typography variant="body1" paragraph>
          A collection of useful text manipulation and analysis tools.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {textTools.map((tool) => (
            <Box sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }} key={tool.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={Link} 
                  to={tool.path}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <CardContent sx={{ width: '100%' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1.5,
                        '& .MuiSvgIcon-root': {
                          color: tool.color,
                          mr: 1,
                          fontSize: '1.75rem',
                          p: 0.5,
                          borderRadius: '50%',
                          bgcolor: alpha(tool.color, 0.1)
                        }
                      }}
                    >
                      {tool.icon}
                      <Typography variant="h6" component="h2">
                        {tool.name}
                      </Typography>
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

export default TextToolsPage;
