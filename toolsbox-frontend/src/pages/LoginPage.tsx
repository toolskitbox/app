import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Google as GoogleIcon,
  CheckCircleOutline as CheckIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  CloudUpload as CloudIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);
const MotionButton = motion(Button);
const MotionListItem = motion(ListItem);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, error, signInWithGoogle } = useAuth();
  const [loginInProgress, setLoginInProgress] = useState(false);
  const theme = useTheme();
  
  useEffect(() => {
    // Check for token in URL (from Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Save the token to localStorage
      localStorage.setItem('auth_token', token);
      
      // Reload the page to trigger the auth check
      window.location.href = '/dashboard';
      return;
    }
    
    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  const handleGoogleLogin = async () => {
    setLoginInProgress(true);
    try {
      await signInWithGoogle();
      // The redirect will happen in the useEffect above once user is set
    } catch (err) {
      console.error('Login error:', err);
      setLoginInProgress(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      }}>
        <CircularProgress sx={{ color: '#fff' }} />
      </Box>
    );
  }

  // Benefits with icons
  const benefits = [
    { text: 'Access to all 30+ tools in our collection', icon: <CheckIcon color="primary" /> },
    { text: 'Save your tool preferences and settings', icon: <SaveIcon color="primary" /> },
    { text: 'History of your recent tool usage', icon: <HistoryIcon color="primary" /> },
    { text: 'Secure storage for your processed files', icon: <CloudIcon color="primary" /> },
    { text: 'Privacy-focused with no third-party data sharing', icon: <SecurityIcon color="primary" /> }
  ];
  
  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      position: 'fixed',
      top: 0,
      left: 0,
      bgcolor: theme.palette.background.default
    }}>
      {/* Header - Only visible on mobile */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' },
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          ToolsKitBox
        </Typography>
      </Box>

      {/* Left side - Illustration and branding */}
      <MotionBox 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          height: '100%',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract shapes for visual interest */}
        <Box sx={{ 
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: alpha('#fff', 0.05),
          top: '-10%',
          left: '-10%'
        }} />
        
        <Box sx={{ 
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: alpha('#fff', 0.05),
          bottom: '-5%',
          right: '-5%'
        }} />

        <MotionTypography 
          variant="h1" 
          sx={{ fontWeight: 800, mb: 2, zIndex: 1 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ToolsKitBox
        </MotionTypography>

        <MotionTypography 
          variant="h5" 
          sx={{ mb: 8, fontWeight: 300, textAlign: 'center', maxWidth: '80%', zIndex: 1 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Your All-in-One Online Toolkit for Everyday Tasks
        </MotionTypography>

        {/* Tool icons grid */}
        <MotionBox 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 3,
            width: '70%',
            maxWidth: '400px',
            zIndex: 1
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {['🎬', '🔊', '🖼️', '📝', '🌐', '⚙️', '🔧', '📊', '🔍'].map((emoji, index) => (
            <MotionBox 
              key={index} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + (index * 0.1) }}
              whileHover={{ scale: 1.1, backgroundColor: alpha('#fff', 0.15) }}
              sx={{ 
                bgcolor: alpha('#fff', 0.1), 
                borderRadius: 2, 
                p: 2, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontSize: '2rem',
                aspectRatio: '1/1'
              }}
            >
              {emoji}
            </MotionBox>
          ))}
        </MotionBox>
      </MotionBox>

      {/* Right side - Login form */}
      <Box sx={{
        width: { xs: '100%', md: '50%' },
        height: { xs: 'calc(100% - 56px)', md: '100%' }, // Adjust for mobile header
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, md: 6 }
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 2,
                boxShadow: theme.shadows[2]
              }}
            >
              {error}
            </Alert>
          )}
          
          <MotionBox
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                display: { xs: 'block', md: 'block' }
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 5 }}
            >
              Sign in to access all our tools and features
            </Typography>
          </MotionBox>
          
          <MotionButton
            variant="contained"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loginInProgress}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              bgcolor: '#4285F4',
              boxShadow: theme.shadows[3],
              '&:hover': {
                bgcolor: '#3367D6',
                boxShadow: theme.shadows[5],
              }
            }}
          >
            {loginInProgress ? (
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            ) : (
              'Continue with Google'
            )}
          </MotionButton>
          
          <MotionBox 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            sx={{ 
              mt: 6, 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.6)
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Why Sign In?
            </Typography>
            
            <List disablePadding>
              {benefits.map((benefit, index) => (
                <MotionListItem 
                  key={index} 
                  disableGutters 
                  disablePadding 
                  sx={{ mb: 2 }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {benefit.icon}
                  </ListItemIcon>
                  <ListItemText primary={benefit.text} />
                </MotionListItem>
              ))}
            </List>
            
            <MotionTypography 
              variant="body2" 
              sx={{ 
                mt: 2, 
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <SecurityIcon fontSize="small" color="info" />
              We value your privacy. We only use your basic profile information to create your account and never share your data with third parties.
            </MotionTypography>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
