import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardActionArea, useTheme, alpha } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Language as LanguageIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  Code as CodeIcon,
  TextSnippet as TextSnippetIcon,
  Email as EmailIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import BreadcrumbTrail from '../../components/common/BreadcrumbTrail';

const WebToolsPage: React.FC = () => {
  const theme = useTheme();
  
  // Define all web tools
  const webTools = [
    {
      id: 1,
      name: 'QR Code',
      path: '/tools/web/qr-code',
      description: 'Generate and scan QR codes',
      icon: <QrCodeIcon />,
      color: theme.palette.primary.main
    },
    {
      id: 2,
      name: 'URL Shortener',
      path: '/tools/web/url-shortener',
      description: 'Shorten long URLs for easier sharing',
      icon: <LinkIcon />,
      color: theme.palette.secondary.main
    },
    {
      id: 3,
      name: 'IP Lookup',
      path: '/tools/web/ip-lookup',
      description: 'Get detailed information about an IP address',
      icon: <PublicIcon />,
      color: '#3f51b5'
    },
    {
      id: 4,
      name: 'Meta Tag Generator',
      path: '/tools/web/meta-tag-generator',
      description: 'Create meta tags for better SEO',
      icon: <CodeIcon />,
      color: '#f50057'
    },
    {
      id: 5,
      name: 'URL Encoder/Decoder',
      path: '/tools/web/url-encoder',
      description: 'Encode or decode URLs for web use',
      icon: <LanguageIcon />,
      color: '#2196f3'
    },
    {
      id: 6,
      name: 'Slug Generator',
      path: '/tools/web/slug-generator',
      description: 'Create SEO-friendly URL slugs',
      icon: <TextSnippetIcon />,
      color: '#ff9800'
    },
    {
      id: 7,
      name: 'Temporary Email',
      path: '/tools/web/temp-email',
      description: 'Create disposable email addresses',
      icon: <EmailIcon />,
      color: '#4caf50'
    },
    {
      id: 8,
      name: 'Online Notepad',
      path: '/tools/web/online-notepad',
      description: 'Take notes and save them online',
      icon: <NoteIcon />,
      color: '#9c27b0'
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Breadcrumbs */}
        <BreadcrumbTrail sx={{ mb: 4 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Web Tools
        </Typography>
        <Typography variant="body1" paragraph>
          A collection of useful web development and analysis tools.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {webTools.map((tool) => (
            <Box key={tool.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
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

export default WebToolsPage;
