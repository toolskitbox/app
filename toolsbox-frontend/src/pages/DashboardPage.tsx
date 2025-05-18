import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,

  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper,
  Avatar,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowForward as ArrowForwardIcon,
  Movie as MovieIcon,
  TextFields as TextFieldsIcon,
  Language as LanguageIcon,
  Code as CodeIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import BreadcrumbTrail from '../components/common/BreadcrumbTrail';

// Motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

// Tool category icons
const categoryIcons: { [key: string]: React.ReactNode } = {
  media: <MovieIcon />,
  text: <TextFieldsIcon />,
  web: <LanguageIcon />,
  dev: <CodeIcon />,
  utility: <BuildIcon />
};

// Mock recent tools data
const recentTools = [
  { id: 1, name: 'Video Downloader', path: '/tools/media/video-downloader', category: 'media', usedAt: '2025-05-12T09:30:00Z' },
  { id: 2, name: 'Image Resizer', path: '/tools/media/image-tools', category: 'media', usedAt: '2025-05-11T14:45:00Z' },
  { id: 3, name: 'QR Code Generator', path: '/tools/web/qr-code', category: 'web', usedAt: '2025-05-10T11:20:00Z' },
  { id: 4, name: 'JSON to XML Converter', path: '/tools/dev/json-xml-converter', category: 'dev', usedAt: '2025-05-09T16:15:00Z' }
];

// Mock popular tools data
const popularTools = [
  { id: 1, name: 'Video Downloader', path: '/tools/media/video-downloader', category: 'media', users: 12453 },
  { id: 2, name: 'PDF to DOC Converter', path: '/tools/text/file-converter', category: 'text', users: 9876 },
  { id: 3, name: 'QR Code Generator', path: '/tools/web/qr-code', category: 'web', users: 8765 },
  { id: 4, name: 'Password Generator', path: '/tools/utility/password-tools', category: 'utility', users: 7654 },
  { id: 5, name: 'Image Compressor', path: '/tools/media/image-tools', category: 'media', users: 6543 },
  { id: 6, name: 'URL Shortener', path: '/tools/web/url-shortener', category: 'web', users: 5432 }
];

// Tool categories
const toolCategories = [
  {
    name: 'Media Tools',
    path: '/tools/media',
    icon: <MovieIcon fontSize="large" />,
    color: '#3f51b5',
    count: 4
  },
  {
    name: 'Text Tools',
    path: '/tools/text',
    icon: <TextFieldsIcon fontSize="large" />,
    color: '#f50057',
    count: 7
  },
  {
    name: 'Web Tools',
    path: '/tools/web',
    icon: <LanguageIcon fontSize="large" />,
    color: '#2196f3',
    count: 8
  },
  {
    name: 'Dev Tools',
    path: '/tools/dev',
    icon: <CodeIcon fontSize="large" />,
    color: '#ff9800',
    count: 4
  },
  {
    name: 'Utility Tools',
    path: '/tools/utility',
    icon: <BuildIcon fontSize="large" />,
    color: '#4caf50',
    count: 7
  }
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([1, 3]); // Mock favorite tools
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId: number) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      
      {/* Welcome Section */}
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={user?.avatar || undefined}
            alt={user?.name || 'User'}
            sx={{ width: 64, height: 64, mr: 3, bgcolor: 'white', color: theme.palette.primary.main }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              Your all-in-one toolkit is ready. What would you like to do today?
            </Typography>
          </Box>
        </Box>
      </MotionPaper>
      
      {/* Tool Categories */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Tool Categories
      </Typography>
      
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ mb: 6 }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {toolCategories.map((category, index) => (
            <Box key={category.name} sx={{ width: { xs: '50%', sm: '33.33%', md: '20%' }, p: 1.5 }}>
              <MotionCard
                variants={itemVariants}
                onClick={() => navigate(category.path)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 8px 16px ${alpha(category.color, 0.2)}`
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    bgcolor: alpha(category.color, 0.1),
                    color: category.color
                  }}
                >
                  {category.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.count} tools
                </Typography>
              </MotionCard>
            </Box>
          ))}
        </Box>
      </MotionBox>
      
      {/* Recent and Popular Tools */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Recent Tools */}
        <Box sx={{ width: { xs: '100%', md: '48%' } }}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recently Used Tools
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ p: 0 }}>
              {recentTools.map((tool) => (
                <ListItem
                  key={tool.id}
                  component={Link}
                  to={tool.path}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                  secondaryAction={
                    <Tooltip title="Use this tool">
                      <IconButton edge="end" aria-label="go to tool" size="small">
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {categoryIcons[tool.category]}
                  </ListItemIcon>
                  <ListItemText
                    primary={tool.name}
                    secondary={`Used on ${formatDate(tool.usedAt)}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
            
            {recentTools.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                You haven't used any tools yet. Start exploring!
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                component={Link}
                to="/history"
                color="primary"
                endIcon={<ArrowForwardIcon />}
              >
                View Full History
              </Button>
            </Box>
          </Paper>
        </Box>
        
        {/* Popular Tools */}
        <Box sx={{ width: { xs: '100%', md: '48%' } }}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Popular Tools
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {popularTools.map((tool) => (
                <Box sx={{ width: { xs: '100%', sm: '48%' } }} key={tool.id}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton
                          size="small"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            toggleFavorite(tool.id);
                          }}
                          sx={{
                            color: favorites.includes(tool.id) ? 'error.main' : 'action.disabled'
                          }}
                        >
                          {favorites.includes(tool.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            mr: 1.5,
                            color: theme.palette.primary.main
                          }}
                        >
                          {categoryIcons[tool.category]}
                        </Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '50%'
                          }}
                        >
                          {tool.name}
                        </Typography>
                      </Box>
                      
                      <Chip
                        size="small"
                        label={`${tool.users.toLocaleString()} users`}
                        sx={{ mt: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        component={Link}
                        to={tool.path}
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ ml: 'auto' }}
                      >
                        Use Tool
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
