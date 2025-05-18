import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import { post } from '../../../utils/api';

interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

interface IpLookupResponse {
  message: string;
  ip: string;
  data: IpApiResponse;
}

const IpLookupPage: React.FC = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [ipInfo, setIpInfo] = useState<IpApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupIp = async () => {
    if (!ipAddress) {
      setError('Please enter an IP address');
      return;
    }

    // Simple IP validation
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
      setError('Please enter a valid IPv4 address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call the backend API to lookup the IP
      const response = await post<IpLookupResponse>('/tools/web/ip-lookup', {
        ip: ipAddress
      });
      
      setIpInfo(response.data.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error looking up IP:', err);
      setError(err.response?.data?.message || 'Failed to lookup IP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          IP Lookup
        </Typography>
        <Typography variant="body1" paragraph>
          Get detailed information about an IP address.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              label="Enter IP Address"
              fullWidth
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={lookupIp}
              disabled={loading}
            >
              Lookup
            </Button>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {ipInfo && !loading && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">IP Address</Typography>
                  <Typography variant="body1">{ipInfo.query}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body1">{ipInfo.city}, {ipInfo.regionName}, {ipInfo.country} ({ipInfo.countryCode})</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Coordinates</Typography>
                  <Typography variant="body1">{ipInfo.lat}, {ipInfo.lon}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">ISP</Typography>
                  <Typography variant="body1">{ipInfo.isp}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Organization</Typography>
                  <Typography variant="body1">{ipInfo.org || 'N/A'}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">AS Number</Typography>
                  <Typography variant="body1">{ipInfo.as}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Postal Code</Typography>
                  <Typography variant="body1">{ipInfo.zip || 'N/A'}</Typography>
                </Paper>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Timezone</Typography>
                  <Typography variant="body1">{ipInfo.timezone}</Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default IpLookupPage;
