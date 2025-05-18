import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Paper, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

interface FormatOption {
  value: string;
  label: string;
  mimeType: string;
}

const ImageConverterPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatOptions: FormatOption[] = [
    { value: 'image/jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
    { value: 'image/png', label: 'PNG', mimeType: 'image/png' },
    { value: 'image/webp', label: 'WebP', mimeType: 'image/webp' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset converted image
      setConvertedImageUrl(null);
    }
  };

  const handleFormatChange = (event: any) => {
    setTargetFormat(event.target.value);
  };

  const handleConvert = () => {
    if (!previewUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const convertedUrl = canvas.toDataURL(targetFormat, quality);
        setConvertedImageUrl(convertedUrl);
      }
    };
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!convertedImageUrl) return;
    
    const format = targetFormat.split('/')[1];
    const link = document.createElement('a');
    link.href = convertedImageUrl;
    link.download = `converted-${selectedFile?.name?.split('.')[0] || 'image'}.${format}`;
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
          Image Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert your images between different formats (JPEG, PNG, WebP).
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
                Conversion Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Target Format</InputLabel>
                    <Select
                      value={targetFormat}
                      label="Target Format"
                      onChange={handleFormatChange}
                    >
                      {formatOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={handleConvert}
                    sx={{ mr: 1 }}
                  >
                    Convert Image
                  </Button>
                </Box>
              </Box>
              
              {convertedImageUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Converted Image
                  </Typography>
                  <Box 
                    component="img" 
                    src={convertedImageUrl} 
                    alt="Converted" 
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
                    Download Converted Image
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

export default ImageConverterPage;
