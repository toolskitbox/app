import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumbs, 
  Typography, 
  Box, 
  useTheme, 
  Paper,
  Chip,
  alpha,
  SxProps,
  Theme
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  TextFields as TextFieldsIcon,
  Language as LanguageIcon,
  Code as CodeIcon,
  Build as BuildIcon
} from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbTrailProps {
  extraCrumbs?: BreadcrumbItem[];
  sx?: SxProps<Theme>; // Allow passing sx props for styling
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({ extraCrumbs = [], sx }) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Define category icons - wrapped in useMemo to avoid dependency issues
  const categoryIcons = useMemo(() => ({
    home: <HomeIcon fontSize="small" />,
    dashboard: <DashboardIcon fontSize="small" />,
    media: <MovieIcon fontSize="small" />,
    text: <TextFieldsIcon fontSize="small" />,
    web: <LanguageIcon fontSize="small" />,
    dev: <CodeIcon fontSize="small" />,
    utility: <BuildIcon fontSize="small" />
  } as Record<string, React.ReactElement>), []);
  
  // Generate breadcrumbs based on current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [
      { label: 'Home', path: '/', icon: categoryIcons.home }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Handle special cases
      if (segment === 'dashboard') {
        result.push({ 
          label: 'Dashboard', 
          path: currentPath,
          icon: categoryIcons.dashboard
        });
      } 
      else if (segment === 'tools' && index < pathSegments.length - 1) {
        // Skip the "tools" segment in the breadcrumb display
        return;
      }
      else if (['media', 'text', 'web', 'dev', 'utility'].includes(segment)) {
        const categoryName = `${segment.charAt(0).toUpperCase()}${segment.slice(1)} Tools`;
        // Use type assertion to ensure TypeScript knows we're accessing a valid key
        const icon = segment in categoryIcons ? categoryIcons[segment] : undefined;
        result.push({ 
          label: categoryName, 
          path: currentPath,
          icon: icon
        });
      }
      else if (index === pathSegments.length - 1 && pathSegments[index - 1] && ['media', 'text', 'web', 'dev', 'utility'].includes(pathSegments[index - 1])) {
        // This is a specific tool page
        const toolName = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        result.push({ 
          label: toolName, 
          path: currentPath 
        });
      }
    });
    
    // Add any extra breadcrumbs
    return [...result, ...extraCrumbs];
  }, [location.pathname, extraCrumbs, categoryIcons]);
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on the home page
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 4
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 2
        },
        ...(sx || {}) // Spread the sx props safely
      }}
    >
      <Breadcrumbs
        separator={
          <NavigateNextIcon 
            fontSize="small" 
            sx={{ 
              color: alpha(theme.palette.text.primary, 0.4)
            }}
          />
        }
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          if (isLast) {
            return (
              <Chip
                key={crumb.path}
                label={crumb.label}
                icon={crumb.icon ? React.cloneElement(crumb.icon as React.ReactElement, {
                  // Ensure icon is properly typed as ReactElement
                }) : undefined}
                color="primary"
                size="small"
                sx={{ 
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            );
          }
          
          return (
            <Link 
              key={crumb.path} 
              to={crumb.path}
              style={{ 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main
                  },
                  transition: 'color 0.2s ease'
                }}
              >
                {crumb.icon && (
                  <Box 
                    component="span" 
                    sx={{ 
                      mr: 0.5, 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'inherit'
                    }}
                  >
                    {crumb.icon}
                  </Box>
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'inherit'
                  }}
                >
                  {crumb.label}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Paper>
  );
};

export default BreadcrumbTrail;
