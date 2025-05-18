import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  useTheme,
  alpha
} from '@mui/material';
import BreadcrumbTrail from '../../components/common/BreadcrumbTrail';
import {
  Movie as MovieIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  Videocam as VideoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Motion components
const MotionContainer = motion(Container);
const MotionBox = motion(Box);
const MotionCard = motion(Card);

const MediaToolsPage: React.FC = () => {
  const theme = useTheme();
  
  // Media tools data
  const mediaTools = [
    {
      id: 1,
      title: 'Video Downloader',
      description: 'Download videos from YouTube, Dailymotion, and other popular platforms in various formats and quality levels.',
      icon: <MovieIcon fontSize="large" />,
      path: '/tools/media/video-downloader',
      color: theme.palette.primary.main,
      image: '/images/tools/video-downloader.jpg'
    },
    {
      id: 2,
      title: 'Audio Converter',
      description: 'Convert audio files between different formats (MP3, WAV, OGG, AAC, FLAC) and adjust bitrate and quality.',
      icon: <AudioIcon fontSize="large" />,
      path: '/tools/media/audio-converter',
      color: '#ff9800',
      image: '/images/tools/audio-converter.jpg'
    },
    {
      id: 3,
      title: 'Image Tools',
      description: 'Resize, compress, and convert images between formats (JPG, PNG, WebP, GIF) while preserving quality.',
      icon: <ImageIcon fontSize="large" />,
      path: '/tools/media/image-tools',
      color: '#4caf50',
      image: '/images/tools/image-tools.jpg'
    },
    {
      id: 4,
      title: 'Video Converter',
      description: 'Convert videos between formats (MP4, AVI, MOV, WebM) and adjust resolution, framerate, and quality.',
      icon: <VideoIcon fontSize="large" />,
      path: '/tools/media/video-converter',
      color: '#e91e63',
      image: '/images/tools/video-converter.jpg'
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
    <MotionContainer
      maxWidth="lg"
      sx={{ py: 4 }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      
      {/* Page Title */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Media Tools
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          Powerful tools to download, convert, and manipulate media files.
          Process videos, audio, and images with ease.
        </Typography>
      </Box>
      
      {/* Tools Grid */}
      <MotionBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} variants={containerVariants}>
        {mediaTools.map((tool) => (
          <MotionBox sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(50% - 16px)' } }} key={tool.id} variants={itemVariants}>
            <MotionCard
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 20px ${alpha(tool.color, 0.2)}`
                }
              }}
            >
              <CardActionArea component={Link} to={tool.path} sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: alpha(tool.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      color: tool.color,
                      transform: 'scale(2)'
                    }}
                  >
                    {tool.icon}
                  </Box>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600, color: tool.color }}>
                    {tool.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </MotionCard>
          </MotionBox>
        ))}
      </MotionBox>
      
      {/* Features Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Key Features
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            {
              title: 'High-Quality Conversions',
              description: 'Our tools use advanced algorithms to ensure the highest quality output for all your media files.'
            },
            {
              title: 'Batch Processing',
              description: 'Process multiple files at once to save time and streamline your workflow.'
            },
            {
              title: 'Format Flexibility',
              description: 'Support for a wide range of formats ensures compatibility with all your devices and platforms.'
            },
            {
              title: 'Secure Processing',
              description: 'All your files are processed securely and deleted after completion to protect your privacy.'
            }
          ].map((feature, index) => (
            <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }} key={index}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1]
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Usage Tips */}
      <Box sx={{ mt: 8, p: 4, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Tips for Best Results
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                For video downloads, always choose the appropriate quality based on your internet speed.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                When compressing images, find the right balance between file size and quality.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                For audio conversion, higher bitrates result in better sound quality but larger file sizes.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Convert videos to MP4 format for the best compatibility across devices.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </MotionContainer>
  );
};

export default MediaToolsPage;
