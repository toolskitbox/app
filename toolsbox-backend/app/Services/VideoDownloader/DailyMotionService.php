<?php

namespace App\Services\VideoDownloader;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class DailyMotionService
{
    /**
     * Get DailyMotion video information
     *
     * @param string $url
     * @return array
     */
    public function getVideoInfo($url)
    {
        // Extract video ID from URL
        $videoId = $this->extractVideoId($url);
        if (!$videoId) {
            throw new \Exception('Invalid DailyMotion URL');
        }
        
        // Get video details from DailyMotion API
        $apiUrl = "https://api.dailymotion.com/video/{$videoId}?fields=title,thumbnail_url,duration,owner.screenname,description,views_total";
        $response = Http::get($apiUrl);
        
        if (!$response->successful()) {
            throw new \Exception('Failed to fetch video information from DailyMotion API: ' . $response->body());
        }
        
        $videoData = $response->json();
        
        // Check if video exists
        if (empty($videoData) || isset($videoData['error'])) {
            throw new \Exception('Video not found on DailyMotion: ' . ($videoData['error'] ?? 'Unknown error'));
        }
        
        // Format duration (seconds to human-readable)
        $duration = $this->formatSecondsToTime($videoData['duration'] ?? 0);
        
        // Get actual formats using youtube-dl
        $formats = $this->getFormats("https://www.dailymotion.com/video/{$videoId}");
        
        // Get thumbnail
        $thumbnail = $videoData['thumbnail_url'] ?? "https://www.dailymotion.com/thumbnail/video/{$videoId}";
        
        // Get high-quality thumbnail if available
        if ($thumbnail) {
            // Replace thumbnail resolution to get higher quality
            $thumbnail = str_replace('x240', 'x720', $thumbnail);
        }
        
        return [
            'success' => true,
            'video' => [
                'id' => $videoId,
                'title' => $videoData['title'] ?? "DailyMotion Video {$videoId}",
                'thumbnail' => $thumbnail,
                'duration' => $duration,
                'author' => $videoData['owner.screenname'] ?? 'DailyMotion User',
                'description' => $videoData['description'] ?? '',
                'views' => $videoData['views_total'] ?? '0',
                'formats' => $formats
            ]
        ];
    }
    
    /**
     * Download DailyMotion video
     *
     * @param string $url
     * @param string $format
     * @param string $formatId
     * @return array
     */
    public function downloadVideo($url, $format, $formatId)
    {
        // Extract video ID from URL
        $videoId = $this->extractVideoId($url);
        if (!$videoId) {
            throw new \Exception('Invalid DailyMotion URL');
        }
        
        // Check if youtube-dl/yt-dlp is available
        if (!$this->isCommandAvailable('youtube-dl') && !$this->isCommandAvailable('yt-dlp')) {
            $this->installYtDlp();
        }
        
        // Use yt-dlp if available, otherwise use youtube-dl
        $command = $this->isCommandAvailable('yt-dlp') ? 'yt-dlp' : 'youtube-dl';
        
        // Generate a unique filename
        $timestamp = time();
        $extension = explode('_', $format)[0]; // Extract extension from format
        $filename = "dailymotion_{$videoId}_{$formatId}_{$timestamp}";
        
        // Set mime type based on extension
        if ($extension == 'mp4') {
            $mimeType = "video/mp4";
        } else if ($extension == 'mp3') {
            $mimeType = "audio/mpeg";
            $extension = 'mp3';
        } else {
            $mimeType = "application/octet-stream";
        }
        
        // Set download directory
        $downloadDir = storage_path('app/public/downloads');
        if (!file_exists($downloadDir)) {
            mkdir($downloadDir, 0755, true);
        }
        
        $outputFile = "{$downloadDir}/{$filename}.{$extension}";
        
        // Create a unique download ID for this download
        $downloadId = uniqid('dl_');
        
        // Prepare output file path
        $outputFile = "{$downloadDir}/{$filename}.{$extension}";
        
        // Check if we already have this video downloaded
        $existingFile = glob("{$downloadDir}/dailymotion_{$videoId}_{$formatId}_*.{$extension}");
        if (!empty($existingFile)) {
            $existingFile = $existingFile[0];
            Log::info("Using existing download for video {$videoId} with format {$formatId}");
            
            // Get file size
            $size = filesize($existingFile);
            $formattedSize = $this->formatBytes($size);
            
            // Create a download URL using the public route
            $existingFilename = basename($existingFile);
            $downloadUrl = url("/api/tools/media/download/{$existingFilename}");
            
            return [
                'success' => true,
                'message' => 'Using existing download',
                'download' => [
                    'url' => $downloadUrl,
                    'filename' => $existingFilename,
                    'mime_type' => $mimeType,
                    'size' => $formattedSize,
                    'expires_in' => 3600 // Link expires in 1 hour
                ]
            ];
        }
        
        // Create progress tracking file
        $progressFile = storage_path("app/public/downloads/progress_{$downloadId}.json");
        $progressData = [
            'id' => $downloadId,
            'video_id' => $videoId,
            'format' => $format,
            'format_id' => $formatId,
            'status' => 'starting',
            'progress' => 0,
            'downloaded_bytes' => 0,
            'total_bytes' => 0,
            'eta' => 'unknown',
            'speed' => 'unknown',
            'output_file' => $outputFile,
            'started_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        file_put_contents($progressFile, json_encode($progressData));
        
        // Create log files for yt-dlp output
        $errorLogFile = storage_path("logs/yt-dlp-error-{$downloadId}.log");
        $outputLogFile = storage_path("logs/yt-dlp-output-{$downloadId}.log");
        
        // Make sure the logs directory exists
        if (!file_exists(storage_path('logs'))) {
            mkdir(storage_path('logs'), 0755, true);
        }
        
        // Use yt-dlp if available, otherwise use youtube-dl
        $command = $this->isCommandAvailable('yt-dlp') ? 'yt-dlp' : 'youtube-dl';
        
        // Get cached formats if available to determine the best format ID to use
        $cachedFormats = $this->getCachedFormats($videoId);
        $specificFormatId = null;
        
        // If we have cached formats, try to find the exact format ID that matches the requested format
        if ($cachedFormats && !empty($cachedFormats)) {
            Log::info("Using cached formats for download of video ID: {$videoId}");
            
            // Find the format that matches the requested format
            foreach ($cachedFormats as $cachedFormat) {
                if (isset($cachedFormat['value']) && $cachedFormat['value'] === $format) {
                    $specificFormatId = $cachedFormat['format_id'] ?? null;
                    break;
                }
                
                // Also check if the format_id matches directly
                if (isset($cachedFormat['format_id']) && $cachedFormat['format_id'] === $formatId) {
                    $specificFormatId = $formatId;
                    break;
                }
            }
            
            // Add format information to progress data
            $progressData['format_info'] = $cachedFormats;
            file_put_contents($progressFile, json_encode($progressData));
        }
        
        // Prepare the download command
        if ($format === 'mp3_audio') {
            // For audio downloads
            $dmDlpCommand = "{$command} -f 'bestaudio' --extract-audio --audio-format mp3 --audio-quality 0 '{$url}' -o '{$outputFile}' --no-playlist --no-check-certificate";
        } else {
            // If we have a specific format ID from the cache, use it directly
            if ($specificFormatId) {
                Log::info("Using specific format ID for download: {$specificFormatId}");
                $dmDlpCommand = "{$command} -f '{$specificFormatId}' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
            } else {
                // For video formats without a specific format ID
                if ($format === 'mp4_1080p' || $formatId === 'hd1080') {
                    $dmDlpCommand = "{$command} -f 'bestvideo[height>=1080][height<2160]+bestaudio/best[height>=1080][height<2160]' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } elseif ($format === 'mp4_720p' || $formatId === 'hd') {
                    $dmDlpCommand = "{$command} -f 'bestvideo[height>=720][height<1080]+bestaudio/best[height>=720][height<1080]' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } elseif ($format === 'mp4_480p' || $formatId === 'sd') {
                    $dmDlpCommand = "{$command} -f 'bestvideo[height>=480][height<720]+bestaudio/best[height>=480][height<720]' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } elseif ($format === 'mp4_380p' || $formatId === 'ld') {
                    $dmDlpCommand = "{$command} -f 'bestvideo[height<=480]+bestaudio/best[height<=480]' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } else {
                    // Use the best available format
                    $dmDlpCommand = "{$command} -f 'best' '{$url}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                }
            }
        }
        
        // Add optimization flags and progress tracking
        $dmDlpCommand .= " --concurrent-fragments 5 --throttled-rate 100K --progress --newline";
        
        // Execute the command in background and redirect output to log files
        $dmDlpCommand = "nohup {$dmDlpCommand} > {$outputLogFile} 2> {$errorLogFile} & echo $!";

        // Use our dedicated Artisan command to monitor the download
        $monitorCommand = "php " . base_path('artisan') . " download:monitor {$downloadId} {$progressFile} %d > /dev/null 2>&1 & echo $!";

        try {
            // Start the process and capture the PID
            $process = Process::start($dmDlpCommand);
            $output = $process->wait();
            $pid = trim($output->output()); // Get the PID from the command output

            if (!is_numeric($pid)) {
                throw new \Exception('Failed to get valid PID from command: ' . $pid);
            }

            Log::info("Started download process with PID: {$pid}");

            // Start the progress monitor using our artisan command
            $monitorCommandWithPid = sprintf($monitorCommand, $pid);
            Log::info("Starting monitor with command: {$monitorCommandWithPid}");
            Process::start($monitorCommandWithPid);

            // Update progress data to indicate download has started
            $progressData['status'] = 'downloading';
            $progressData['message'] = 'Download started in background';
            $progressData['updated_at'] = date('Y-m-d H:i:s');
            file_put_contents($progressFile, json_encode($progressData));
        } catch (\Exception $e) {
            // Update progress data to indicate failure
            $progressData['status'] = 'failed';
            $progressData['message'] = $e->getMessage();
            $progressData['updated_at'] = date('Y-m-d H:i:s');
            file_put_contents($progressFile, json_encode($progressData));

            Log::error("Failed to start download process: " . $e->getMessage());
            throw new \Exception('Failed to start download process: ' . $e->getMessage());
        }
        
        // Store PID in progress data for potential cancellation
        $progressData['pid'] = trim($pid);
        file_put_contents($progressFile, json_encode($progressData));
        
        // Update the progress data to include more information
        $progressData['status'] = 'downloading';
        $progressData['command'] = $dmDlpCommand;
        $progressData['output_log'] = $outputLogFile;
        $progressData['error_log'] = $errorLogFile;
        
        // Save updated progress data
        file_put_contents($progressFile, json_encode($progressData));

        // Return the download information with progress tracking
        return [
            'success' => true,
            'message' => 'Download started',
            'progress' => [
                'download_id' => $downloadId,
                'status' => 'starting',
                'progress' => 0,
                'eta' => 'calculating...',
                'speed' => '0 KB/s'
            ]
        ];
    }
    
    /**
     * Extract DailyMotion video ID from URL
     *
     * @param string $url
     * @return string|null
     */
    public function extractVideoId($url)
    {
        $pattern = '/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    /**
     * Format seconds to human-readable time
     *
     * @param int $seconds
     * @return string
     */
    private function formatSecondsToTime($seconds)
    {
        $seconds = (int) $seconds;
        
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        
        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $secs);
        } else {
            return sprintf('%d:%02d', $minutes, $secs);
        }
    }
    
    /**
     * Get cached formats for a video
     *
     * @param string $videoId
     * @return array|null
     */
    public function getCachedFormats($videoId)
    {
        $cacheKey = "dailymotion_formats_{$videoId}";
        $cachedOutput = cache()->get($cacheKey);
        
        if (!$cachedOutput) {
            return null;
        }
        
        // Process the cached output the same way we process the original output
        return $this->processFormatOutput($cachedOutput, $videoId);
    }
    
    /**
     * Process format output from yt-dlp
     *
     * @param array $output
     * @param string $videoId
     * @return array
     */
    private function processFormatOutput($output, $videoId)
    {
        // Process formats from tabular text output
        $formats = [];
        $seenFormats = [];
        $formatStarted = false;

        // Debug logging
        Log::debug("Processing format output for video ID: {$videoId}");

        foreach ($output as $line) {
            // Skip lines until we find the header line
            if (!$formatStarted && strpos($line, 'ID') !== false && strpos($line, 'EXT') !== false && strpos($line, 'RESOLUTION') !== false) {
                $formatStarted = true;
                continue;
            }
            
            // Skip divider lines
            if (strpos($line, '─────') !== false) {
                continue;
            }
            
            // Process format lines after the header
            if ($formatStarted && !empty(trim($line))) {
                // Example line format:
                // hls-380 mp4 512x288    │ ~397.94MiB  461k m3u8  │ avc1.42001e mp4a.40.5
                
                // Split the line by whitespace and extract relevant parts
                $parts = preg_split('/\s+/', trim($line), -1, PREG_SPLIT_NO_EMPTY);
                
                if (count($parts) >= 3) {
                    $formatId = $parts[0];
                    $extension = $parts[1];
                    $resolution = $parts[2];
                    
                    // Extract filesize if available (it's in a format like ~397.94MiB)
                    $filesize = 'unknown';
                    foreach ($parts as $part) {
                        if (strpos($part, 'MiB') !== false || strpos($part, 'GiB') !== false || strpos($part, 'KiB') !== false) {
                            $filesize = $part;
                            break;
                        }
                    }
                    
                    // Extract codec information
                    $vcodec = 'unknown';
                    $acodec = 'unknown';
                    foreach ($parts as $index => $part) {
                        if (strpos($part, 'avc1.') !== false || strpos($part, 'vp9') !== false) {
                            $vcodec = $part;
                            // The next part is likely the audio codec
                            if (isset($parts[$index + 1]) && (strpos($parts[$index + 1], 'mp4a.') !== false || strpos($parts[$index + 1], 'opus') !== false)) {
                                $acodec = $parts[$index + 1];
                            }
                            break;
                        }
                    }
                    
                    // Skip duplicate formats
                    $formatKey = "{$extension}_{$resolution}";
                    if (isset($seenFormats[$formatKey])) {
                        continue;
                    }
                    
                    // Determine quality
                    $quality = 'medium';
                    if (strpos($resolution, '1080') !== false) {
                        $quality = 'high';
                    } elseif (strpos($resolution, '720') !== false) {
                        $quality = 'medium';
                    } elseif (strpos($resolution, '480') !== false || strpos($resolution, '380') !== false || strpos($resolution, '360') !== false) {
                        $quality = 'low';
                    }
                    
                    // Create format entry
                    if ($vcodec !== 'none' && $acodec !== 'none') {
                        // Video with audio
                        $formats[] = [
                            'label' => "{$resolution} {$extension}",
                            'value' => "{$extension}_{$formatId}",
                            'quality' => $quality,
                            'size' => $filesize,
                            'format_id' => $formatId
                        ];
                        $seenFormats[$formatKey] = true;
                    } elseif ($vcodec === 'none' && $acodec !== 'none') {
                        // Audio only
                        $formats[] = [
                            'label' => "Audio Only ({$extension})",
                            'value' => "{$extension}_audio_{$formatId}",
                            'quality' => 'audio',
                            'size' => $filesize,
                            'format_id' => $formatId
                        ];
                    }
                }
            }
        }

        // Sort formats by quality (high to low)
        usort($formats, function($a, $b) {
            $qualityOrder = ['high' => 1, 'medium' => 2, 'low' => 3, 'audio' => 4];
            return $qualityOrder[$a['quality']] <=> $qualityOrder[$b['quality']];
        });
        
        return $formats;
    }
    
    /**
     * Get DailyMotion video formats
     *
     * @param string $url
     * @return array
     */
    public function getFormats($url)
    {
        try {
            $videoId = $this->extractVideoId($url);
            
            // Check if we have cached formats first
            $cachedFormats = $this->getCachedFormats($videoId);
            if ($cachedFormats && !empty($cachedFormats)) {
                Log::info("Using cached formats for video ID: {$videoId}");
                return $cachedFormats;
            }

            // Check if youtube-dl is installed
            if (!$this->isCommandAvailable('youtube-dl') && !$this->isCommandAvailable('yt-dlp')) {
                // If youtube-dl is not available, install yt-dlp (modern alternative)
                $this->installYtDlp();
            }
            
            // Use yt-dlp if available, otherwise use youtube-dl
            $command = "yt-dlp -F '{$url}' --list-formats --no-playlist --skip-download";
            
            // Get video formats
            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                Log::error("yt-dlp format listing failed: " . implode("\n", $output));
                // Fall back to predefined formats
                return [];
            }

            // Store the raw format output in the cache for later use
            $cacheKey = "dailymotion_formats_{$videoId}";
            cache()->put($cacheKey, $output, now()->addHours(1)); // Cache for 1 hour

            if (empty($output)) {
                throw new \Exception("Failed to get video formats from {$command}");
            }

            // Process formats from tabular text output
            $formats = [];
            $seenFormats = [];
            $formatStarted = false;

            // Debug logging
            Log::debug("yt-dlp output: " . implode("\n", $output));

            foreach ($output as $line) {
                // Skip lines until we find the header line
                if (!$formatStarted && strpos($line, 'ID') !== false && strpos($line, 'EXT') !== false && strpos($line, 'RESOLUTION') !== false) {
                    $formatStarted = true;
                    continue;
                }
                
                // Skip divider lines
                if (strpos($line, '─────') !== false) {
                    continue;
                }
                
                // Process format lines after the header
                if ($formatStarted && !empty(trim($line))) {
                    // Example line format:
                    // hls-380 mp4 512x288    │ ~397.94MiB  461k m3u8  │ avc1.42001e mp4a.40.5
                    
                    // Split the line by whitespace and extract relevant parts
                    $parts = preg_split('/\s+/', trim($line), -1, PREG_SPLIT_NO_EMPTY);
                    
                    if (count($parts) >= 3) {
                        $formatId = $parts[0];
                        $extension = $parts[1];
                        $resolution = $parts[2];
                        
                        // Extract filesize if available (it's in a format like ~397.94MiB)
                        $filesize = 'unknown';
                        foreach ($parts as $part) {
                            if (strpos($part, 'MiB') !== false || strpos($part, 'GiB') !== false || strpos($part, 'KiB') !== false) {
                                $filesize = $part;
                                break;
                            }
                        }
                        
                        // Extract codec information
                        $vcodec = 'unknown';
                        $acodec = 'unknown';
                        foreach ($parts as $index => $part) {
                            if (strpos($part, 'avc1.') !== false || strpos($part, 'vp9') !== false) {
                                $vcodec = $part;
                                // The next part is likely the audio codec
                                if (isset($parts[$index + 1]) && (strpos($parts[$index + 1], 'mp4a.') !== false || strpos($parts[$index + 1], 'opus') !== false)) {
                                    $acodec = $parts[$index + 1];
                                }
                                break;
                            }
                        }
                        
                        // Skip duplicate formats
                        $formatKey = "{$extension}_{$resolution}";
                        if (isset($seenFormats[$formatKey])) {
                            continue;
                        }
                        
                        // Determine quality
                        $quality = 'medium';
                        if (strpos($resolution, '1080') !== false) {
                            $quality = 'high';
                        } elseif (strpos($resolution, '720') !== false) {
                            $quality = 'medium';
                        } elseif (strpos($resolution, '480') !== false || strpos($resolution, '380') !== false || strpos($resolution, '360') !== false) {
                            $quality = 'low';
                        }
                        
                        // Create format entry
                        if ($vcodec !== 'none' && $acodec !== 'none') {
                            // Video with audio
                            $formats[] = [
                                'label' => "{$resolution} {$extension}",
                                'value' => "{$extension}_{$formatId}",
                                'quality' => $quality,
                                'size' => $filesize,
                                'format_id' => $formatId
                            ];
                            $seenFormats[$formatKey] = true;
                        } elseif ($vcodec === 'none' && $acodec !== 'none') {
                            // Audio only
                            $formats[] = [
                                'label' => "Audio Only ({$extension})",
                                'value' => "{$extension}_audio_{$formatId}",
                                'quality' => 'audio',
                                'size' => $filesize,
                                'format_id' => $formatId
                            ];
                        }
                    }
                }
            }

            // Sort formats by quality (high to low)
            usort($formats, function($a, $b) {
                $qualityOrder = ['high' => 1, 'medium' => 2, 'low' => 3, 'audio' => 4];
                return $qualityOrder[$a['quality']] <=> $qualityOrder[$b['quality']];
            });
            
            // If no formats were found, return some default formats with estimated sizes
            if (empty($formats)) {
                return [
                    ['label' => '1080p MP4', 'value' => 'mp4_1080p', 'quality' => 'high', 'size' => '~150-250 MB', 'format_id' => 'hd1080'],
                    ['label' => '720p MP4', 'value' => 'mp4_720p', 'quality' => 'medium', 'size' => '~80-120 MB', 'format_id' => 'hd'],
                    ['label' => '480p MP4', 'value' => 'mp4_480p', 'quality' => 'medium', 'size' => '~40-60 MB', 'format_id' => 'sd'],
                    ['label' => '380p MP4', 'value' => 'mp4_380p', 'quality' => 'low', 'size' => '~20-30 MB', 'format_id' => 'ld'],
                    ['label' => 'Audio Only (MP3)', 'value' => 'mp3_audio', 'quality' => 'audio', 'size' => '~5-10 MB', 'format_id' => 'audio']
                ];
            }

            return $formats;
        } catch (\Exception $e) {
            // Log the error
            Log::error("DailyMotion format detection error: {$e->getMessage()}");
            
            // Return default formats with estimated sizes if there's an error
            return [
                ['label' => '1080p MP4', 'value' => 'mp4_1080p', 'quality' => 'high', 'size' => '~150-250 MB', 'format_id' => 'hd1080'],
                ['label' => '720p MP4', 'value' => 'mp4_720p', 'quality' => 'medium', 'size' => '~80-120 MB', 'format_id' => 'hd'],
                ['label' => '480p MP4', 'value' => 'mp4_480p', 'quality' => 'medium', 'size' => '~40-60 MB', 'format_id' => 'sd'],
                ['label' => '380p MP4', 'value' => 'mp4_380p', 'quality' => 'low', 'size' => '~20-30 MB', 'format_id' => 'ld'],
                ['label' => 'Audio Only (MP3)', 'value' => 'mp3_audio', 'quality' => 'audio', 'size' => '~5-10 MB', 'format_id' => 'audio']
            ];
        }
    }
    
    /**
     * Check if a command is available in the system
     *
     * @param string $command
     * @return bool
     */
    private function isCommandAvailable($command)
    {
        $whereIsCommand = (PHP_OS == 'WINNT') ? "where {$command}" : "which {$command}";
        $return = shell_exec("{$whereIsCommand} 2>&1");
        return !empty($return);
    }
    
    /**
     * Install yt-dlp
     *
     * @return bool
     */
    private function installYtDlp()
    {
        try {
            if (PHP_OS == 'WINNT') {
                // Windows installation
                $installDir = storage_path('app/bin');
                if (!file_exists($installDir)) {
                    mkdir($installDir, 0755, true);
                }
                
                $ytDlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
                $ytDlpPath = "{$installDir}/yt-dlp.exe";
                
                file_put_contents($ytDlpPath, file_get_contents($ytDlpUrl));
                chmod($ytDlpPath, 0755);
                
                // Add to PATH temporarily
                putenv("PATH=" . getenv("PATH") . PATH_SEPARATOR . $installDir);
            } else {
                // Linux/Mac installation
                shell_exec('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp');
            }
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to install yt-dlp: {$e->getMessage()}");
            return false;
        }
    }
    
    /**
     * Format bytes to human-readable size
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
    
    /**
     * Cancel a download in progress
     *
     * @param string $downloadId
     * @return array
     */
    public function cancelDownload($downloadId)
    {
        Log::info("Cancelling DailyMotion download with ID: {$downloadId}");
        
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
        
        // Check if we have a PID to kill
        if (isset($progressData['pid']) && !empty($progressData['pid'])) {
            $pid = $progressData['pid'];
            
            // Kill the process
            shell_exec("kill -9 {$pid} 2>/dev/null");
            
            // Also kill any child processes that might be running
            shell_exec("pkill -P {$pid} 2>/dev/null");
            
            Log::info("Killed download process with PID: {$pid}");
        }
        
        // Update the progress file to indicate cancellation
        $progressData['status'] = 'failed';
        $progressData['message'] = 'Download cancelled by user';
        $progressData['updated_at'] = date('Y-m-d H:i:s');
        file_put_contents($progressFile, json_encode($progressData));
        
        // Clean up any partial download file
        if (isset($progressData['output_file']) && file_exists($progressData['output_file'])) {
            unlink($progressData['output_file']);
            Log::info("Removed partial download file: {$progressData['output_file']}");
        }
        
        // Check if there's a PID for the download process
        if (isset($progressData['pid']) && $progressData['pid']) {
            $pid = $progressData['pid'];
            
            // Attempt to terminate the process
            try {
                // On Linux/Unix systems
                if (PHP_OS !== 'WINNT') {
                    exec("kill -9 {$pid} 2>/dev/null");
                    
                    // Also kill any child processes
                    exec("pkill -P {$pid} 2>/dev/null");
                } else {
                    // On Windows
                    exec("taskkill /F /PID {$pid} 2>nul");
                }
                
                Log::info("Terminated DailyMotion download process with PID: {$pid}");
            } catch (\Exception $e) {
                Log::error("Failed to terminate process: {$e->getMessage()}");
            }
        }
        
        // Check if there's a monitor process ID
        if (isset($progressData['monitor_pid']) && $progressData['monitor_pid']) {
            $monitorPid = $progressData['monitor_pid'];
            
            try {
                // On Linux/Unix systems
                if (PHP_OS !== 'WINNT') {
                    exec("kill -9 {$monitorPid} 2>/dev/null");
                } else {
                    // On Windows
                    exec("taskkill /F /PID {$monitorPid} 2>nul");
                }
                
                Log::info("Terminated DailyMotion monitor process with PID: {$monitorPid}");
            } catch (\Exception $e) {
                Log::error("Failed to terminate monitor process: {$e->getMessage()}");
            }
        }
        
        // Update the progress file to mark the download as cancelled
        $progressData['status'] = 'cancelled';
        $progressData['message'] = 'Download cancelled by user';
        $progressData['updated_at'] = date('Y-m-d H:i:s');
        
        file_put_contents($progressFile, json_encode($progressData));
        
        // Clean up any partial download files
        $outputFile = $progressData['output_file'] ?? null;
        if ($outputFile && file_exists($outputFile) && is_file($outputFile)) {
            // If it's a partial download (less than 10MB), delete it
            if (filesize($outputFile) < 10 * 1024 * 1024) {
                unlink($outputFile);
                Log::info("Deleted partial DailyMotion download file: {$outputFile}");
            }
        }
        
        return [
            'success' => true,
            'message' => 'Download cancelled successfully'
        ];
    }
}
