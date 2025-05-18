import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Alert, Link, Snackbar } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import { post } from '../../../utils/api';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface ShortenUrlResponse {
  message: string;
  original_url: string;
  short_url: string;
  code: string;
  expires_at: string | null;
}

const UrlShortenerPage: React.FC = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const shortenUrl = async () => {
    if (!longUrl) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL format
    if (!longUrl.match(/^(http|https):\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/?#].*)?$/)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call the backend API to shorten the URL
      const response = await post<ShortenUrlResponse>('/tools/web/url-shortener', {
        url: longUrl
      });
      
      setShortUrl(response.data.short_url);
      setLoading(false);
    } catch (err: any) {
      console.error('Error shortening URL:', err);
      setError(err.response?.data?.message || 'Failed to shorten URL. Please try again.');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setShowSnackbar(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  const openShortUrl = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <Container maxWidth="md">
      <BreadcrumbTrail />
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          URL Shortener
        </Typography>
        <Typography variant="body1" paragraph>
          Shorten your long URLs into more manageable links.
        </Typography>

        <Box component="form" noValidate sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Enter Long URL"
            variant="outlined"
            value={longUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={shortenUrl}
            disabled={loading}
            startIcon={<LinkIcon />}
            sx={{ mb: 3 }}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {shortUrl && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your shortened URL:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ flexGrow: 1, wordBreak: 'break-all' }}
                >
                  <Link href={shortUrl} target="_blank" color="primary">
                    {shortUrl}
                  </Link>
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={copyToClipboard}
                  startIcon={<ContentCopyIcon />}
                  sx={{ ml: 2 }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={openShortUrl}
                  startIcon={<OpenInNewIcon />}
                  sx={{ ml: 1 }}
                >
                  Open
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="URL copied to clipboard!"
      />
    </Container>
  );
};

export default UrlShortenerPage;
