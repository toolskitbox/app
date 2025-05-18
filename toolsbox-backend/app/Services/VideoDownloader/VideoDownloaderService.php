<?php

namespace App\Services\VideoDownloader;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VideoDownloaderService
{
    /**
     * Get video information from URL
     *
     * @param string $url
     * @return array
     */
    public function getVideoInfo($url)
    {
        if ($this->isYouTubeUrl($url)) {
            $service = new YouTubeService();
            return $service->getVideoInfo($url);
        } elseif ($this->isDailyMotionUrl($url)) {
            $service = new DailyMotionService();
            return $service->getVideoInfo($url);
        } else {
            throw new \Exception('Unsupported video platform. Please use YouTube or DailyMotion URLs.');
        }
    }
    
    /**
     * Download video from URL
     *
     * @param string $url
     * @param string $format
     * @param string $formatId
     * @return array
     */
    public function downloadVideo($url, $format, $formatId)
    {
        if ($this->isYouTubeUrl($url)) {
            $service = new YouTubeService();
            return $service->downloadVideo($url, $format, $formatId);
        } elseif ($this->isDailyMotionUrl($url)) {
            $service = new DailyMotionService();
            return $service->downloadVideo($url, $format, $formatId);
        } else {
            throw new \Exception('Unsupported video platform. Please use YouTube or DailyMotion URLs.');
        }
    }
    
    /**
     * Check if URL is from YouTube
     *
     * @param string $url
     * @return bool
     */
    public function isYouTubeUrl($url)
    {
        return strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false;
    }
    
    /**
     * Check if URL is from DailyMotion
     *
     * @param string $url
     * @return bool
     */
    public function isDailyMotionUrl($url)
    {
        return strpos($url, 'dailymotion.com') !== false || strpos($url, 'dai.ly') !== false;
    }
    
    /**
     * Cancel a download in progress
     *
     * @param string $downloadId
     * @return array
     */
    public function cancelDownload($downloadId)
    {
        // Determine the platform from the progress file
        $downloadsDir = storage_path('app/public/downloads');
        $progressFile = "{$downloadsDir}/progress_{$downloadId}.json";
        
        if (!file_exists($progressFile)) {
            return [
                'success' => false,
                'message' => 'Download not found'
            ];
        }
        
        // Read the progress file to get information about the download
        $progressData = json_decode(file_get_contents($progressFile), true);
        
        // Determine which service to use based on the platform in the progress data
        $platform = $progressData['platform'] ?? 'youtube'; // Default to YouTube if not specified
        
        if ($platform === 'dailymotion') {
            $service = new DailyMotionService();
        } else {
            // Default to YouTube service
            $service = new YouTubeService();
        }
        
        return $service->cancelDownload($downloadId);
    }
}
