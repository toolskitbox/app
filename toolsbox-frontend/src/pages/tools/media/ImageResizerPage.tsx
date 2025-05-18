import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Paper, Button, Slider, TextField } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const ImageResizerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(4/3);
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviewUrl(e.target.result);
          
          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            setAspectRatio(img.width / img.height);
          };
          img.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);
      
      // Reset resized image
      setResizedImageUrl(null);
    }
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(event.target.value, 10) || 0;
    setWidth(newWidth);
    
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(event.target.value, 10) || 0;
    setHeight(newHeight);
    
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleResize = () => {
    if (!previewUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const resizedUrl = canvas.toDataURL(selectedFile?.type || 'image/png');
        setResizedImageUrl(resizedUrl);
      }
    };
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!resizedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = resizedImageUrl;
    link.download = `resized-${selectedFile?.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Image Resizer
        </Typography>
        <Typography variant="body1" paragraph>
          Resize your images to specific dimensions while maintaining quality.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Image
          </Typography>
          <Button 
            variant="contained" 
            component="label"
            sx={{ mb: 2 }}
          >
            Select Image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          
          {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Original Image
              </Typography>
              <Box 
                component="img" 
                src={previewUrl} 
                alt="Preview" 
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  display: 'block',
                  mb: 3
                }} 
              />
              
              <Typography variant="subtitle1" gutterBottom>
                Resize Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <TextField
                      label="Width (px)"
                      type="number"
                      fullWidth
                      value={width}
                      onChange={handleWidthChange}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <TextField
                      label="Height (px)"
                      type="number"
                      fullWidth
                      value={height}
                      onChange={handleHeightChange}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={handleResize}
                    sx={{ mr: 1 }}
                  >
                    Resize Image
                  </Button>
                </Box>
              </Box>
              
              {resizedImageUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Resized Image
                  </Typography>
                  <Box 
                    component="img" 
                    src={resizedImageUrl} 
                    alt="Resized" 
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      display: 'block',
                      mb: 2
                    }} 
                  />
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleDownload}
                  >
                    Download Resized Image
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ImageResizerPage;
