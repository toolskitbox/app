import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  CardMedia,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Movie as MovieIcon,
  TextFields as TextFieldsIcon,
  Language as LanguageIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import BreadcrumbTrail from '../components/common/BreadcrumbTrail';

// Animated components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);

const HomePage: React.FC = () => {
  const theme = useTheme();
  
  // Tool categories
  const categories = [
    {
      title: 'Media Tools',
      description: 'Download videos, convert audio/video files, and process images with our powerful media tools.',
      icon: <MovieIcon fontSize="large" />,
      path: '/tools/media',
      color: theme.palette.primary.main,
      tools: [
        'YouTube / Dailymotion Video Downloader',
        'Audio Converter',
        'Image Resizer/Compressor/Converter',
        'Video Converter'
      ]
    },
    {
      title: 'Text Tools',
      description: 'Convert file formats, manipulate text, and analyze content with our text processing tools.',
      icon: <TextFieldsIcon fontSize="large" />,
      path: '/tools/text',
      color: theme.palette.secondary.main,
      tools: [
        'File Converter (PDF to DOC, DOC to PDF, etc.)',
        'String Length, Hashing & Encrypting',
        'Word & Character Counter',
        'Case Converter',
        'Text Difference Checker',
        'Binary Text Converter'
      ]
    },
    {
      title: 'Web Tools',
      description: 'Generate QR codes, shorten URLs, and create meta tags with our web development tools.',
      icon: <LanguageIcon fontSize="large" />,
      path: '/tools/web',
      color: '#2196f3',
      tools: [
        'QR Code Generator & Scanner',
        'URL Shortener',
        'IP Address Lookup & Geolocation',
        'Meta Tag Generator',
        'URL Encoder/Decoder',
        'Slug Generator',
        'Online Notepad'
      ]
    },
    {
      title: 'Developer Tools',
      description: 'Test regular expressions, convert data formats, and generate SQL data for your development needs.',
      icon: <CodeIcon fontSize="large" />,
      path: '/tools/dev',
      color: '#ff9800',
      tools: [
        'Regex Generator & Tester',
        'JSON to XML Converter',
        'Base64 Image Converter',
        'SQL Data Generator'
      ]
    },
    {
      title: 'Utility Tools',
      description: 'Convert units, generate passwords, and calculate dates with our everyday utility tools.',
      icon: <BuildIcon fontSize="large" />,
      path: '/tools/utility',
      color: '#4caf50',
      tools: [
        'Unit & Currency Converter',
        'Password Generator & Strength Checker',
        'Unix Timestamp Converter',
        'Time Zone Converter',
        'Date/Time Difference Calculator',
        'Age Calculator',
        'Typing Speed Test'
      ]
    }
  ];
  
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
    <Box>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <BreadcrumbTrail sx={{ mb: 2 }} />
      </Container>
      
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: theme.palette.mode === 'light' ? 0.1 : 0.05,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <MotionTypography

              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Your All-in-One Online Toolkit
            </MotionTypography>
            <MotionTypography 
              variant="h5" 
              align="center" 
              color="text.secondary" 
              paragraph
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              ToolsKitBox provides over 30 free online tools to help you with everyday tasks.
              From media conversion to developer utilities, we've got you covered.
            </MotionTypography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                component={Link} 
                to="/login" 
                variant="contained" 
                size="large" 
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Get Started
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <MotionTypography
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Explore Our Tools
        </MotionTypography>
        
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {categories.map((category, index) => (
              <Box sx={{ width: { xs: '100%', md: '45%', lg: '30%' } }} key={category.title}>
                <MotionCard
                  variants={itemVariants}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 20px ${alpha(category.color, 0.2)}`
                    }
                  }}
                >
                  <CardMedia
                    sx={{ 
                      height: 140, 
                      bgcolor: alpha(category.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        color: category.color,
                        transform: 'scale(2)'
                      }}
                    >
                      {category.icon}
                    </Box>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3" sx={{ color: category.color, fontWeight: 600 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                      Popular Tools:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {category.tools.slice(0, 3).map((tool, idx) => (
                        <Typography key={idx} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {tool}
                        </Typography>
                      ))}
                      {category.tools.length > 3 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          And {category.tools.length - 3} more...
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={category.path} 
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        ml: 'auto', 
                        color: category.color,
                        '&:hover': {
                          bgcolor: alpha(category.color, 0.1)
                        }
                      }}
                    >
                      Explore Tools
                    </Button>
                  </CardActions>
                </MotionCard>
              </Box>
            ))}
          </Box>
        </MotionBox>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900', py: 8 }}>
        <Container maxWidth="lg">
          <MotionTypography
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </MotionTypography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Box 
                  component="img" 
                  src="/how-it-works.svg" 
                  alt="How ToolsKitBox works" 
                  sx={{ 
                    width: '100%', 
                    maxWidth: 500, 
                    display: 'block', 
                    mx: 'auto' 
                  }} 
                />
              </MotionBox>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Simple, Fast, and Secure
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                  Using ToolsKitBox is incredibly easy. Just follow these simple steps:
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  {[
                    { 
                      title: '1. Sign in with Google', 
                      description: 'Create an account or sign in using your Google account for a seamless experience.' 
                    },
                    { 
                      title: '2. Choose a Tool', 
                      description: 'Browse our extensive collection of tools and select the one you need.' 
                    },
                    { 
                      title: '3. Use the Tool', 
                      description: 'Follow the simple instructions to use the tool and get your results instantly.' 
                    },
                    { 
                      title: '4. Download or Share', 
                      description: 'Download your processed files or share the results directly with others.' 
                    }
                  ].map((step, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Button 
                    component={Link} 
                    to="/login" 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      minWidth: 200,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  >
                    Get Started Now
                  </Button>
                </Box>
              </MotionBox>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <MotionTypography
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What Our Users Say
        </MotionTypography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            {
              name: 'Sarah Johnson',
              role: 'Content Creator',
              comment: 'ToolsKitBox has become an essential part of my workflow. The video downloader and image tools save me hours every week!',
              avatar: '/avatars/user1.jpg'
            },
            {
              name: 'Michael Chen',
              role: 'Web Developer',
              comment: 'As a developer, I use the regex tester and JSON converter almost daily. Clean interface and reliable results every time.',
              avatar: '/avatars/user2.jpg'
            },
            {
              name: 'Emily Rodriguez',
              role: 'Digital Marketer',
              comment: 'The URL shortener and meta tag generator have been game-changers for our marketing campaigns. Highly recommended!',
              avatar: '/avatars/user3.jpg'
            }
          ].map((testimonial, index) => (
            <Box key={index} sx={{ width: { xs: '100%', md: '31%' } }}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  borderRadius: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    component="img"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      mr: 2
                    }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                  "{testimonial.comment}"
                </Typography>
              </MotionCard>
            </Box>
          ))}
        </Box>
      </Container>
      
      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <MotionTypography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 700 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Boost Your Productivity?
          </MotionTypography>
          <MotionTypography
            variant="h6"
            paragraph
            sx={{ mb: 4, opacity: 0.9 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of users who trust ToolsKitBox for their everyday online tasks.
            Sign up now and access all our tools for free!
          </MotionTypography>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9)
                }
              }}
            >
              Get Started for Free
            </Button>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
