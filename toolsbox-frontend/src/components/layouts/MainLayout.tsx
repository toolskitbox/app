import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ComingSoonBadge from '../common/ComingSoonBadge';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Collapse,
  ListSubheader
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  TextFields as TextFieldsIcon,
  Language as LanguageIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  ExpandLess,
  ExpandMore,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

const drawerWidth = 240;

interface CategoryItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { name: string; path: string }[];
}

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  // Define category key type for type safety
  type CategoryKey = 'media' | 'text' | 'web' | 'dev' | 'utility';
  
  // Initialize open categories based on current path
  const initializeOpenCategories = () => {
    const initialState = {
      media: false,
      text: false,
      web: false,
      dev: false,
      utility: false
    };
    
    // Check if current path matches any category path
    for (const category of categories) {
      const categoryKey = category.name.toLowerCase().split(' ')[0] as CategoryKey;
      if (location.pathname.startsWith(category.path)) {
        initialState[categoryKey] = true;
      }
      
      // Also check if current path matches any subitem path
      category.subItems?.forEach(subItem => {
        if (location.pathname === subItem.path) {
          initialState[categoryKey] = true;
        }
      });
    }
    
    return initialState;
  };
  
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    media: false,
    text: false,
    web: false,
    dev: false,
    utility: false
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleCategoryClick = (category: string) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category]
    });
  };
  
  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/login');
  };
  
  const categories: CategoryItem[] = [
    {
      name: 'Media Tools',
      path: '/tools/media',
      icon: <MovieIcon />,
      subItems: [
        { name: 'Video Downloader', path: '/tools/media/video-downloader' },
        { name: 'Audio Converter', path: '/tools/media/audio-converter' },
        { name: 'Image Tools', path: '/tools/media/image-tools' },
        { name: 'Video Converter', path: '/tools/media/video-converter' }
      ]
    },
    {
      name: 'Text Tools',
      path: '/tools/text',
      icon: <TextFieldsIcon />,
      subItems: [
        { name: 'File Converter', path: '/tools/text/file-converter' },
        { name: 'String Tools', path: '/tools/text/string-tools' },
        { name: 'Case Converter', path: '/tools/text/case-converter' },
        { name: 'Word Counter', path: '/tools/text/word-counter' },
        { name: 'Diff Viewer', path: '/tools/text/diff-viewer' },
        { name: 'Binary Converter', path: '/tools/text/binary-converter' },
        { name: 'Stylish Text', path: '/tools/text/stylish-text' },
        { name: 'JWT Generator', path: '/tools/text/jwt-generator' }
      ]
    },
    {
      name: 'Web Tools',
      path: '/tools/web',
      icon: <LanguageIcon />,
      subItems: [
        { name: 'QR Code', path: '/tools/web/qr-code' },
        { name: 'URL Shortener', path: '/tools/web/url-shortener' },
        { name: 'IP Lookup', path: '/tools/web/ip-lookup' },
        { name: 'Meta Tag Generator', path: '/tools/web/meta-tag-generator' },
        { name: 'URL Encoder/Decoder', path: '/tools/web/url-encoder' },
        { name: 'Slug Generator', path: '/tools/web/slug-generator' },
        { name: 'Temporary Email', path: '/tools/web/temp-email' },
        { name: 'Online Notepad', path: '/tools/web/online-notepad' }
      ]
    },
    {
      name: 'Dev Tools',
      path: '/tools/dev',
      icon: <CodeIcon />,
      subItems: [
        { name: 'Regex Tester', path: '/tools/dev/regex-tool' },
        { name: 'JSON/XML Converter', path: '/tools/dev/json-xml-converter' },
        { name: 'Base64 Converter', path: '/tools/dev/base64-converter' }
      ]
    },
    {
      name: 'Utility Tools',
      path: '/tools/utility',
      icon: <BuildIcon />,
      subItems: [
        { name: 'Unit Converter', path: '/tools/utility/unit-converter' },
        { name: 'Password Tools', path: '/tools/utility/password-tools' },
        { name: 'Timestamp Converter', path: '/tools/utility/timestamp-converter' },
        { name: 'Time Zone Converter', path: '/tools/utility/timezone-converter' },
        { name: 'Date Calculator', path: '/tools/utility/date-calculator' },
        { name: 'Age Calculator', path: '/tools/utility/age-calculator' },
        { name: 'Typing Test', path: '/tools/utility/typing-test' }
      ]
    }
  ];
  
  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: theme.spacing(0, 1)
      }}>
        <Typography variant="h6" noWrap component={Link} to="/" sx={{ 
          textDecoration: 'none', 
          color: 'inherit',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box component="img" src="/images/logo.png" alt="ToolsKitBox Logo" sx={{ height: 32, mr: 1 }} />
          ToolsKitBox
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" selected={location.pathname === '/'}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        
        {user && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard" selected={location.pathname === '/dashboard'}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      
      <Divider />
      
      <List
        subheader={
          <ListSubheader component="div" id="tools-list-subheader">
            Tools
          </ListSubheader>
        }
      >
        {categories.map((category) => (
          <React.Fragment key={category.name}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => handleCategoryClick(category.name.toLowerCase().split(' ')[0])}
                selected={location.pathname === category.path || location.pathname.startsWith(category.path + '/')}
              >
                <ListItemIcon>
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.name} />
                {openCategories[category.name.toLowerCase().split(' ')[0]] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={openCategories[category.name.toLowerCase().split(' ')[0]]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {category.subItems?.map((item) => (
                  <ListItemButton 
                    key={item.name}
                    sx={{ pl: 4 }}
                    component={Link}
                    to={item.path}
                    selected={location.pathname === item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.name}
                          {(item.name === 'Audio Converter' || 
                            item.name === 'Video Converter' || 
                            item.name === 'Image Tools' || 
                            item.name === 'File Converter' ||
                            item.name === 'JWT Generator') && <ComingSoonBadge />}
                        </Box>
                      } 
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
  
  // Effect to update open categories when location changes
  useEffect(() => {
    const updatedOpenCategories = { ...openCategories };
    let hasChanges = false;
    
    for (const category of categories) {
      const categoryKey = category.name.toLowerCase().split(' ')[0] as CategoryKey;
      const shouldBeOpen = location.pathname.startsWith(category.path + '/');
      
      if (shouldBeOpen && !updatedOpenCategories[categoryKey]) {
        updatedOpenCategories[categoryKey] = true;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      setOpenCategories(updatedOpenCategories);
    }
  }, [location.pathname, categories, openCategories]);
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/' ? 'Home' : 
             location.pathname === '/dashboard' ? 'Dashboard' : 
             categories.find(c => location.pathname.startsWith(c.path))?.name || 'ToolsKitBox'}
          </Typography>
          
          {user ? (
            <>
              <IconButton
                onClick={handleProfileMenuClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar 
                  alt={user.name} 
                  src={user.avatar || undefined}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'account-button',
                }}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ToolsKitBox. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
