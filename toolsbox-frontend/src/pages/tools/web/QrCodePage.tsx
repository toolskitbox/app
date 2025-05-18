import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Paper, TextField, Button } from '@mui/material';
import QRCode from 'qrcode.react';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

const QrCodePage: React.FC = () => {
  const [text, setText] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const qrRef = useRef<HTMLDivElement>(null);

  return (
    <Container maxWidth="lg">
      <BreadcrumbTrail />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Generator
        </Typography>
        <Typography variant="body1" paragraph>
          Generate QR codes for URLs, text, or contact information.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Enter text or URL"
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mx: -1 }}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1, textAlign: 'center' }}>
              {text && (
                <Box sx={{ mb: 2 }} ref={qrRef}>
                  <QRCode 
                    value={text} 
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              )}
              
              <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1, textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={!text}
                  onClick={() => {
                    if (qrRef.current) {
                      const canvas = qrRef.current.querySelector('canvas');
                      if (canvas) {
                        const link = document.createElement('a');
                        link.download = 'qrcode.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                      }
                    }
                  }}
                >
                  Download QR Code
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default QrCodePage;
