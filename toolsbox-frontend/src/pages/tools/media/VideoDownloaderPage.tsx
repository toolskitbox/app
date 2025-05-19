import React, { useState, useEffect } from 'react';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Divider,
  SelectChangeEvent,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';
import { post, get } from '../../../utils/api';
import { motion } from 'framer-motion';

// Motion components
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  formats: {
    label: string;
    value: string;
    quality: string;
    size: string;
  }[];
}

interface VideoDownloadResponse {
  success: boolean;
  message: string;
  download?: {
    url: string;
    filename: string;
    mime_type: string;
    size: string;
    expires_in: number;
  };
  video?: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    views: string;
  };
  progress?: {
    download_id: string;
    status: 'starting' | 'downloading' | 'completed' | 'failed';
    progress: number;
    eta?: string;
    speed?: string;
  };
}

interface VideoInfoResponse {
  success: boolean;
  video?: {
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    formats: {
      label: string;
      value: string;
      quality: string;
      size: string;
    }[];
  };
  message?: string;
}

const VideoDownloaderPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('idle');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 KB/s');
  const [downloadEta, setDownloadEta] = useState<string>('calculating...');
  const [progressCheckInterval, setProgressCheckInterval] = useState<number | null>(null);
  
  // Reset states when URL changes
  useEffect(() => {
    setVideoInfo(null);
    setSelectedFormat('');
    setDownloadUrl('');
    setError(null);
  }, [url]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleFormatChange = (e: SelectChangeEvent<string>) => {
    setSelectedFormat(e.target.value as string);
  };
  
  const handleFetchVideo = async () => {
    if (!url) {
      setError('Please enter a video URL');
      return;
    }
    
    // Validate URL
    if (!isValidVideoUrl(url)) {
      setError('Please enter a valid YouTube or Dailymotion URL');
      return;
    }
    
    // Block YouTube downloads completely
    if (isYoutubeUrl(url)) {
      setError('YouTube video downloads are not supported at this time. Please try a Dailymotion video instead.');
      return; // Stop here and don't attempt to download
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the backend API to get video information
      const response = await post<VideoInfoResponse>('/tools/media/video-info', { url });
      
      if (response.data.success && response.data.video) {
        const videoData = response.data.video;
        setVideoInfo({
          title: videoData.title,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration,
          author: videoData.author,
          formats: videoData.formats
        });
        
        // Set default format
        if (videoData.formats.length > 0) {
          setSelectedFormat(videoData.formats[0].value);
        }
      } else {
        setError('Failed to fetch video information. Please check the URL and try again.');
      }
      
    } catch (err) {
      console.error('Error fetching video info:', err);
      setError('Failed to fetch video information. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to check download progress
  const checkDownloadProgress = async (id: string) => {
    // Use the ID passed to this function, not the one from state
    // This ensures we're always checking the specific download requested
    try {
      // Check if we should stop polling (status is already completed or failed)
      if (downloadStatus === 'completed' || downloadStatus === 'failed') {
        console.log(`Download ${id} status already ${downloadStatus}. Skipping API call.`);
        if (progressCheckInterval) {
          clearInterval(progressCheckInterval);
          setProgressCheckInterval(null);
        }
        return;
      }
      
      // Use the apiClient which has the correct base URL configured
      const response = await get(`/tools/media/download-progress/${id}`);
      const data = response.data;
      
      if (data.success && data.progress) {
        // Update progress state
        setDownloadProgress(data.progress.progress);
        setDownloadStatus(data.progress.status);
        setDownloadSpeed(data.progress.speed || '0 KB/s');
        setDownloadEta(data.progress.eta || 'calculating...');

        // If download is completed or failed, clear the interval
        if (data.progress.status === 'completed' || data.progress.status === 'failed') {
          console.log(`Download ${id} status: ${data.progress.status}. Clearing interval.`);
          if (progressCheckInterval) {
            clearInterval(progressCheckInterval);
            setProgressCheckInterval(null);
          }
          
          // Set isDownloading to false for both completed and failed states
          setIsDownloading(false);

          // If failed, show error message
          if (data.progress.status === 'failed') {
            setError(data.progress.message || 'Download failed');
          }
          
          // If completed and we have a download URL, trigger the download
          if (data.progress.status === 'completed' && data.download && data.download.url) {
            triggerFileDownload(data.download.url, data.download.filename);
          }

          // Reset download state after completion
          if (data.progress.status === 'completed') {
            // Set download status to completed but keep the download ID
            // This prevents the cleanup effect from cancelling the download
            setDownloadStatus('completed');
            
            // After a delay to ensure file download starts, reset the other states
            setTimeout(() => {
              setIsDownloading(false);
              // Don't reset the downloadId until the user navigates away
              // This ensures we don't cancel the download prematurely
            }, 3000); // Longer timeout to ensure download starts
          } else if (data.progress.status === 'failed') {
            setError('Download failed. Please try again.');
            setIsDownloading(false);
            setDownloadId(null);
            setDownloadStatus('idle');
          }
        }
      } else if (!data.success) {
        // Handle error or download not found
        console.error('Error checking download progress:', data.message);
        if (progressCheckInterval) {
          clearInterval(progressCheckInterval);
          setProgressCheckInterval(null);
        }
        setError(data.message || 'Failed to check download progress');
        setIsDownloading(false);
        setDownloadId(null);
        setDownloadStatus('idle');
      }
    } catch (err) {
      console.error('Error checking download progress:', err);
      if (progressCheckInterval) {
        clearInterval(progressCheckInterval);
        setProgressCheckInterval(null);
      }
      setError('Failed to check download progress');
      setIsDownloading(false);
      setDownloadId(null);
      setDownloadStatus('idle');
    }
  };

  // Function to trigger file download
  const triggerFileDownload = async (url: string, filename: string) => {
    try {
      console.log(`Triggering download for file: ${filename} from URL: ${url}`);
      
      // Use fetch to get the file as a blob
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename; // Set the suggested filename
      document.body.appendChild(a);
      
      // Trigger the click
      console.log('Clicking download link');
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl); // Release the blob URL
        document.body.removeChild(a);
        console.log('Download link removed from DOM');
      }, 1000); // Longer timeout to ensure the download starts
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download the file');
    }
  };

  // Clean up interval and cancel download on component unmount
  useEffect(() => {
    return () => {
      // Clear any interval
      // if (progressCheckInterval) {
      //   clearInterval(progressCheckInterval);
      // }
      
      // Only cancel downloads that are still in progress
      // This prevents cancelling completed downloads when navigating away
      if (downloadId) {
        console.log(`Component unmounting with download ID: ${downloadId}`);
        
        // Check the latest status directly from the API before cancelling
        const checkFinalStatus = async () => {
          // Use the captured download ID from the parent scope
          // This ensures we're using the ID that was current when the cleanup function was created
          console.log(`Final status check for download ID: ${downloadId}`);
          
          try {
            // Make one final check to the API to get the latest status
            const response = await get(`/tools/media/download-progress/${downloadId}`);
            const data = response.data;
            
            if (data.success && data.progress) {
              const finalStatus = data.progress.status;

              if (finalStatus === 'downloading') {
                return;
              }
              
              // Only cancel if the latest status is not completed or failed
              if (finalStatus !== 'completed' && finalStatus !== 'failed') {
                console.log(`Cancelling download ${downloadId} on component unmount (final status: ${finalStatus})`);
                cancelDownload(downloadId);
              } else {
                console.log(`Not cancelling download ${downloadId} with final status ${finalStatus} on unmount`);
              }
            } else {
              // If we can't get the status, use the local state as fallback
              if (downloadStatus !== 'completed' && downloadStatus !== 'failed') {
                console.log(`Cancelling download ${downloadId} on component unmount (local status: ${downloadStatus})`);
                cancelDownload(downloadId);
              } else {
                console.log(`Not cancelling download ${downloadId} with local status ${downloadStatus} on unmount`);
              }
            }
          } catch (err) {
            // If the API call fails, use the local state as fallback
            if (downloadStatus !== 'completed' && downloadStatus !== 'failed') {
              console.log(`Cancelling download ${downloadId} on component unmount (local status: ${downloadStatus})`);
              cancelDownload(downloadId);
            } else {
              console.log(`Not cancelling download ${downloadId} with local status ${downloadStatus} on unmount`);
            }
          }
        };
        
        // Execute the check immediately
        checkFinalStatus();
      }
    };
  }, [progressCheckInterval, downloadId, downloadStatus]);
  
  // Function to cancel a download
  const cancelDownload = async (id: string) => {
    try {
      const response = await post('/tools/media/video-downloader/cancel', { download_id: id });
      console.log('Download cancelled:', response.data);
    } catch (err) {
      console.error('Error cancelling download:', err);
    }
  };
  
  // Monitor download status and clear interval when completed or failed
  useEffect(() => {
    if (downloadStatus === 'completed' || downloadStatus === 'failed') {
      if (progressCheckInterval) {
        clearInterval(progressCheckInterval);
        setProgressCheckInterval(null);
      }
    }
  }, [downloadStatus, progressCheckInterval]);

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) return;
    
    // First, ensure any existing progress check is completely stopped
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      setProgressCheckInterval(null);
    }
    
    // Clear the download ID before making a new request
    // This is critical to prevent the old ID from being used
    setDownloadId('');
    
    // Reset the download state
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('starting');
    setDownloadSpeed('0 KB/s');
    setDownloadEta('calculating...');
    setError(null);

    try {
      // Get the format details
      const formatDetails = videoInfo.formats.find((f: any) => f.value === selectedFormat);
      if (!formatDetails) {
        throw new Error('Selected format not found');
      }

      // Call the backend API to initiate the download
      const response = await post<VideoDownloadResponse>('/tools/media/video-downloader', {
        url,
        format: selectedFormat,
        format_id: formatDetails.quality
      });

      if (response.data.success) {
        // Check if we have progress information
        if (response.data.progress && response.data.progress.download_id) {
          // Get the download ID directly from the API response
          const newDownloadId = response.data.progress.download_id;
          console.log(`Received new download ID from API: ${newDownloadId}`);
          
          // Update state with the new download ID
          setDownloadId(newDownloadId);

          // Update initial progress
          setDownloadProgress(response.data.progress.progress || 0);
          setDownloadStatus(response.data.progress.status || 'starting');

          // If the download is already completed, trigger the download
          if (response.data.progress.status === 'completed' && response.data.download && response.data.download.url) {
            triggerFileDownload(response.data.download.url, response.data.download.filename);
            setIsDownloading(false);
          } else if (response.data.progress.status === 'failed') {
            // If the download has already failed, show error and don't start polling
            setError(response.data.progress.message || 'Download failed');
            setIsDownloading(false);
          } else {
            // IMPORTANT: Create a closure that captures the new download ID
            // This ensures the interval always uses the correct ID from this API response
            // not whatever might be in state when the interval executes
            const checkProgressWithId = () => {
              console.log(`Checking progress with fixed ID: ${newDownloadId}`);
              return checkDownloadProgress(newDownloadId);
            };
            
            // Start polling for progress updates with the captured ID
            const interval = window.setInterval(checkProgressWithId, 3000); // Check every 3 seconds
            setProgressCheckInterval(interval);
          }
        } else if (response.data.download && response.data.download.url) {
          // If we have a direct download URL without progress tracking
          triggerFileDownload(response.data.download.url, response.data.download.filename);
          setDownloadProgress(100);
          setIsDownloading(false);
        } else {
          throw new Error('No download information received');
        }
      } else {
        throw new Error(response.data.message || 'Failed to prepare download');
      }
    } catch (err) {
      console.error('Error downloading video:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsDownloading(false);
      setDownloadId(null);
      setDownloadStatus('idle');
    }
  };

  // Utility function to validate video URL
  const isValidVideoUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const dailymotionRegex = /^(https?:\/\/)?(www\.)?(dailymotion\.com|dai\.ly)\/.+/;
    
    return youtubeRegex.test(url) || dailymotionRegex.test(url);
  };
  
  const isYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };
  
  return (
    <MotionContainer
      maxWidth="lg"
      sx={{ py: 4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
          Video Downloader
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          Download videos from Dailymotion, and other platforms in various formats and quality levels. Youtube videos will be supported later.
        </Typography>
      </Box>
      
      {/* Main Content */}
      <MotionPaper
        elevation={3}
        sx={{ p: 4, borderRadius: 3, mb: 4 }}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(75% - 8px)' } }}>
              <TextField
                fullWidth
                label="Video URL"
                placeholder="Enter YouTube or Dailymotion URL"
                value={url}
                onChange={handleUrlChange}
                variant="outlined"
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: <YouTubeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(25% - 8px)' } }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleFetchVideo}
                disabled={loading || !url}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                sx={{ height: '56px' }}
              >
                {loading ? 'Fetching...' : 'Fetch Video'}
              </Button>
            </Box>
          </Box>
          
          {/* Example URLs */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
              Example URLs:
            </Typography>
            <Box component="ul" sx={{ mt: 0.5, pl: 3 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Dailymotion: https://www.dailymotion.com/video/x2iuewm
              </Typography>
            </Box>
          </Box>
        </Box>
      </MotionPaper>
      
      {/* Video Information */}
      {videoInfo && (
        <MotionPaper
          elevation={3}
          sx={{ p: 4, borderRadius: 3, mb: 4 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Video Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={videoInfo.thumbnail}
                  alt={videoInfo.title}
                />
              </Card>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: 'calc(66.67% - 16px)' } }}>
              <Typography variant="h6" gutterBottom>
                {videoInfo.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ width: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Author: <strong>{videoInfo.author}</strong>
                  </Typography>
                </Box>
                <Box sx={{ width: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: <strong>{videoInfo.duration}</strong>
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="format-select-label">Select Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={selectedFormat}
                  label="Select Format"
                  onChange={handleFormatChange}
                >
                  {videoInfo.formats.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label} ({format.size})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={handleDownload}
                disabled={isDownloading || !selectedFormat}
                sx={{ height: '56px' }}
              >
                {isDownloading ? 'Downloading...' : 'Download Video'}
              </Button>
              
              {/* Download Progress Bar */}
              {isDownloading && (
                <Box sx={{ mt: 3, width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {downloadStatus === 'starting' && 'Preparing Download...'}
                    {downloadStatus === 'downloading' && 'Downloading Video...'}
                    {downloadStatus === 'completed' && 'Download Complete!'}
                    {downloadStatus === 'failed' && 'Download Failed'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={downloadProgress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: downloadStatus === 'failed' ? 'error.main' : 
                                        downloadStatus === 'completed' ? 'success.main' : 'primary.main'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {downloadProgress}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {downloadStatus === 'downloading' && (
                        <>
                          <span style={{ marginRight: 16 }}>{downloadSpeed}</span>
                          <span>ETA: {downloadEta}</span>
                        </>
                      )}
                    </Typography>
                  </Box>
                  {downloadStatus === 'downloading' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Large videos, especially in 4K quality, may take several minutes to download.
                    </Typography>
                  )}
                </Box>
              )}
              
              {downloadUrl && downloadProgress === 100 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Download completed! 
                  <Button
                    color="inherit"
                    size="small"
                    sx={{ ml: 1 }}
                    href={downloadUrl}
                    download
                  >
                    Save File
                  </Button>
                </Alert>
              )}
            </Box>
          </Box>
        </MotionPaper>
      )}
      
      {/* Instructions */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Step 1: Copy the Video URL
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Go to YouTube or Dailymotion and copy the URL of the video you want to download.
                The URL should look like the examples shown above.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Paste and Fetch
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Paste the URL into the input field above and click "Fetch Video" to retrieve the video information.
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Step 3: Select Format
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose your preferred format and quality from the dropdown menu. Higher quality means larger file size.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 4: Download
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Click the "Download Video" button and wait for the download to complete.
                Once finished, click "Save File" to save the video to your device.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Note:</strong> This tool is for personal use only. Please respect copyright laws and the terms of service of the platforms you download from.
          </Typography>
        </Alert>
      </Paper>
    </MotionContainer>
  );
};

export default VideoDownloaderPage;
