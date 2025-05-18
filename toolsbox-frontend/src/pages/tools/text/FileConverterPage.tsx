import React from 'react';
import { Box, Typography, Container, Paper, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import ComingSoonOverlay from '../../../components/common/ComingSoonOverlay';

const FileConverterPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          File Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert text files between different formats.
        </Typography>
        
        <ComingSoonOverlay>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload File
            </Typography>
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Select File
              <input type="file" hidden />
            </Button>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Convert To</InputLabel>
              <Select label="Convert To" defaultValue="">
                <MenuItem value="txt">TXT</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
              </Select>
            </FormControl>
            
            <Button variant="contained" sx={{ mt: 2 }}>
              Convert
            </Button>
          </Paper>
        </ComingSoonOverlay>
      </Box>
    </Container>
  );
};

export default FileConverterPage;
