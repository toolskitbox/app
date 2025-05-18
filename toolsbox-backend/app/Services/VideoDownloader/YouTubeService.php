<?php

namespace App\Services\VideoDownloader;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Artisan;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use App\Services\ProxyManager;

class YouTubeService
{
    /**
     * @var ProxyManager
     */
    protected $proxyManager;
    
    /**
     * YouTubeService constructor
     * 
     * @param ProxyManager $proxyManager
     */
    public function __construct(ProxyManager $proxyManager)
    {
        $this->proxyManager = $proxyManager;
    }
    
    /**
     * Get YouTube video information
     *
     * @param string $url
     * @return array
     */
    public function getVideoInfo($url)
    {
        // Extract video ID from URL
        $videoId = $this->extractVideoId($url);
        if (!$videoId) {
            throw new \Exception('Invalid YouTube URL');
        }
        
        // Get API key from environment
        $apiKey = env('YOUTUBE_API_KEY');
        if (empty($apiKey)) {
            throw new \Exception('YouTube API key not configured');
        }
        
        // Use YouTube Data API to get video details
        $apiUrl = "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&key={$apiKey}&part=snippet,contentDetails,statistics";
        $response = Http::get($apiUrl);
        
        if (!$response->successful()) {
            Log::error('YouTube API error: ' . $response->body());
            throw new \Exception('Failed to get video information from YouTube API');
        }
        
        $data = $response->json();
        
        // Check if video exists
        if (empty($data['items'])) {
            throw new \Exception('Video not found on YouTube');
        }
        
        $videoData = $data['items'][0];
        $snippet = $videoData['snippet'] ?? [];
        $contentDetails = $videoData['contentDetails'] ?? [];
        $statistics = $videoData['statistics'] ?? [];
        
        // Format duration (ISO 8601 duration to human-readable)
        $duration = $this->formatDuration($contentDetails['duration'] ?? 'PT0S');
        
        // Get actual formats using yt-dlp
        $formats = $this->getFormats("https://www.youtube.com/watch?v={$videoId}");
        
        // Get the best thumbnail available
        $thumbnail = $snippet['thumbnails']['maxres']['url'] ?? 
                    $snippet['thumbnails']['high']['url'] ?? 
                    $snippet['thumbnails']['medium']['url'] ?? 
                    $snippet['thumbnails']['default']['url'] ?? 
                    "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg";
        
        return [
            'success' => true,
            'video' => [
                'id' => $videoId,
                'title' => $snippet['title'] ?? "YouTube Video {$videoId}",
                'thumbnail' => $thumbnail,
                'duration' => $duration,
                'author' => $snippet['channelTitle'] ?? 'YouTube Channel',
                'description' => $snippet['description'] ?? '',
                'views' => $statistics['viewCount'] ?? '0',
                'formats' => $formats
            ]
        ];
    }
    
    /**
     * Download YouTube video
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
            throw new \Exception('Invalid YouTube URL');
        }
        
        // Set download directory
        $downloadDir = storage_path('app/public/downloads');
        if (!file_exists($downloadDir)) {
            mkdir($downloadDir, 0755, true);
        }
        
        try {
            // Get video details from YouTube API
            $apiKey = env('YOUTUBE_API_KEY');
            if (empty($apiKey)) {
                throw new \Exception('YouTube API key not configured');
            }
            
            // Get the video details from YouTube API
            $videoDetails = $this->getVideoDetailsFromApi($videoId);
            
            // Extract video information
            $title = $videoDetails['snippet']['title'] ?? 'Unknown Title';
            $channelTitle = $videoDetails['snippet']['channelTitle'] ?? 'Unknown Channel';
            $description = $videoDetails['snippet']['description'] ?? '';
            $thumbnail = $videoDetails['snippet']['thumbnails']['high']['url'] ?? '';
            $viewCount = $videoDetails['statistics']['viewCount'] ?? 0;
            $likeCount = $videoDetails['statistics']['likeCount'] ?? 0;
            $commentCount = $videoDetails['statistics']['commentCount'] ?? 0;
            
            // Format the duration
            $duration = $this->formatDuration($videoDetails['contentDetails']['duration'] ?? 'PT0S');
            
            // Create a unique download ID for this download
            $downloadId = uniqid('yt_');
            
            // Create progress tracking file
            $progressFile = storage_path("app/public/downloads/progress_{$downloadId}.json");
            $progressData = [
                'id' => $downloadId,
                'video_id' => $videoId,
                'format' => $format,
                'format_id' => $formatId,
                'status' => 'starting',
                'progress' => 0,
                'started_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            file_put_contents($progressFile, json_encode($progressData));
            
            // Get the formats from cache or fetch them
            $formatOutput = $this->getFormats($url);
            
            // Get raw cached format output for more detailed format information
            $cachedRawFormats = cache()->get("youtube_formats_{$videoId}");
            
            // Add format information to progress data for reference
            if ($cachedRawFormats) {
                $progressData['raw_formats'] = $cachedRawFormats;
                file_put_contents($progressFile, json_encode($progressData));
            }
            
            // Determine the actual format ID to use
            $actualFormatId = $this->determineActualFormatId($formatOutput, $format, $formatId);
            
            // Update progress data with the actual format ID
            $progressData['actual_format_id'] = $actualFormatId;
            file_put_contents($progressFile, json_encode($progressData));
            
            // Determine file extension based on format
            $extension = $format === 'mp3' ? 'mp3' : 'mp4';

            // Determine mime type based on extension
            $mimeType = $this->getMimeTypeForExtension($extension);

            // Prepare filename
            $sanitizedTitle = preg_replace('/[^\w\s]/', '', $title);
            $sanitizedTitle = preg_replace('/\s+/', '_', $sanitizedTitle);
            $sanitizedTitle = substr($sanitizedTitle, 0, 50); // Limit length

            // Sanitize format ID to remove special characters that could cause path issues
            $sanitizedFormatId = preg_replace('/[\[\]\/\\=\+]/', '_', $actualFormatId);

            // Include format type in the filename to distinguish between different formats
            if ($format === 'mp3' || $format === 'mp3_audio') {
                $formatType = 'audio';
            } elseif ($format === 'mp4_4k' || $format === 'mp4_628') {
                $formatType = '4k';
            } elseif ($format === 'mp4_hd') {
                $formatType = 'hd';
            } elseif ($format === 'mp4_sd') {
                $formatType = 'sd';
            } else {
                $formatType = 'video';
            }

            $filename = "youtube_{$videoId}_{$formatType}_{$sanitizedFormatId}_{$sanitizedTitle}";

            // Prepare output file path
            $outputDir = storage_path('app/public/downloads');
            if (!file_exists($outputDir)) {
                mkdir($outputDir, 0755, true);
            }
            $outputFile = "{$outputDir}/{$filename}.{$extension}";

            Log::info("Generated filename: {$filename}.{$extension} for format: {$format}");
            
            // Check if we already have this video downloaded
            $existingFile = $this->findExistingDownload($filename);
            if ($existingFile) {
                Log::info("Using existing download for video {$videoId} with format {$actualFormatId}");
                
                // Get file size
                $size = filesize($existingFile);
                $formattedSize = $this->formatBytes($size);
                
                // Create a download URL using the public route
                $filename = basename($existingFile, '.' . $extension);
                $downloadUrl = url("/tools/media/download/{$filename}.{$extension}");
                
                return [
                    'success' => true,
                    'message' => 'Using existing download',
                    'download' => [
                        'url' => $downloadUrl,
                        'filename' => "{$filename}.{$extension}",
                        'mime_type' => $this->getMimeTypeForExtension($extension),
                        'size' => $formattedSize,
                        'expires_in' => 3600 // Link expires in 1 hour
                    ],
                    'video' => [
                        'id' => $videoId,
                        'title' => $title,
                        'thumbnail' => $thumbnail,
                        'duration' => $duration,
                        'author' => $channelTitle,
                        'views' => $viewCount
                    ]
                ];
            }
            
            // Prepare the download command with optimizations
            if ($format === 'mp3' || $format === 'mp3_audio') {
                // For audio downloads, use webm format directly since YouTube provides it natively
                $extension = 'webm'; // Use webm extension for audio downloads
                $outputFile = "{$outputDir}/{$filename}.{$extension}";
                
                // Download only the audio stream in its native format (usually webm)
                // -f bestaudio selects only audio streams, avoiding video download entirely
                // --rm-cache-dir removes temporary files
                // --proxy bypass anti-bot protection
                $proxyOption = $this->getProxyOption();
                $ytdlpCommand = "yt-dlp -f 'bestaudio' {$proxyOption} --rm-cache-dir 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --no-playlist --no-check-certificate";
            } else {
                // For video formats, ensure we get both video and audio
                // Use format selection that combines best video with best audio
                // For mp4 format, ensure we're getting video+audio in mp4 container
                // Log the selected format and format ID for debugging
                Log::info("Selected format: {$format}, Format ID: {$actualFormatId}");
                
                // Check if we have a specific numeric format ID
                $isNumericFormatId = is_numeric($actualFormatId);
                
                if ($isNumericFormatId) {
                    // If we have a specific format ID, use it exactly as specified
                    Log::info("Using exact format ID: {$actualFormatId}");
                    $proxyOption = $this->getProxyOption();
                    $ytdlpCommand = "yt-dlp -f '{$actualFormatId}+bestaudio/best' {$proxyOption} 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } else if ($format === 'mp4_4k' || $format === 'mp4_628') {
                    // 4K quality with audio, preferring mp4 container
                    Log::info("Using 4K quality format");
                    $proxyOption = $this->getProxyOption();
                    $ytdlpCommand = "yt-dlp -f 'bestvideo[height>=2160]+bestaudio/best[height>=2160]' {$proxyOption} 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } elseif ($format === 'mp4_hd') {
                    // HD quality with audio, preferring mp4 container
                    Log::info("Using HD quality format");
                    $proxyOption = $this->getProxyOption();
                    $ytdlpCommand = "yt-dlp -f 'bestvideo[height>=1080][height<2160]+bestaudio/best[height>=1080][height<2160]' {$proxyOption} 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } elseif ($format === 'mp4_sd') {
                    // SD quality with audio, preferring mp4 container
                    Log::info("Using SD quality format");
                    $proxyOption = $this->getProxyOption();
                    $ytdlpCommand = "yt-dlp -f 'bestvideo[height<=720]+bestaudio/best[height<=720]' {$proxyOption} 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                } else {
                    // Use the best available format
                    Log::info("Using best available format");
                    $proxyOption = $this->getProxyOption();
                    $ytdlpCommand = "yt-dlp -f 'best' {$proxyOption} 'https://www.youtube.com/watch?v={$videoId}' -o '{$outputFile}' --merge-output-format mp4 --no-playlist --no-check-certificate";
                }
            }
            
            // Add optimization flags and progress tracking
            $ytdlpCommand .= " --concurrent-fragments 5 --throttled-rate 100K";
            
            // Check if there's already a download in progress for this video and format
            $downloadsDir = storage_path('app/public/downloads');
            $progressFiles = glob("{$downloadsDir}/progress_*.json");
            $currentDownloadId = null;
            foreach ($progressFiles as $existingProgressFile) {
                $existingProgressData = json_decode(file_get_contents($existingProgressFile), true);
                
                // Check if this is a download for the same video and format
                if (isset($existingProgressData['video_id']) && 
                    $existingProgressData['video_id'] === $videoId &&
                    $existingProgressData['format'] === $format &&
                    $existingProgressData['format_id'] === $actualFormatId) {
                    $currentDownloadId = $existingProgressData['id'] ?? null;

                    if ($existingProgressData['status'] == 'completed') {
                        $size = filesize($existingFile);
                        $formattedSize = $this->formatBytes($size);
                        $statusText = 'Download completed';
                    } else {
                        $formattedSize = 'Unknown';
                        $statusText = 'Download already in progress';
                    }
                    
                    // Found an in-progress download for this video
                    $existingDownloadId = $existingProgressData['id'];
                    
                    // Check if the download is still active (updated in the last 30 seconds)
                    $lastUpdated = strtotime($existingProgressData['updated_at']);
                    $currentTime = time();
                    
                    if (($currentTime - $lastUpdated) < 30) {
                        // Download is still active, return the progress information
                        Log::info("Found active download in progress for video {$videoId} with format {$actualFormatId}");
                        
                        return [
                            'success' => true,
                            'message' => $statusText,
                            'download' => [
                                'url' => url("/tools/media/download/{$filename}"), // No URL yet since download is in progress
                                'filename' => $filename.$extension,
                                'mime_type' => $mimeType,
                                'size' => $formattedSize,
                                'expires_in' => 3600, // 1 hour
                            ],
                            'video' => [
                                'id' => $videoId,
                                'title' => $title,
                                'thumbnail' => $thumbnail,
                                'duration' => $duration,
                                'author' => $channelTitle,
                                'views' => $viewCount
                            ],
                            'progress' => [
                                'download_id' => $existingDownloadId,
                                'status' => $existingProgressData['status'],
                                'progress' => $existingProgressData['progress'],
                                'eta' => $existingProgressData['eta'],
                                'speed' => $existingProgressData['speed']
                            ]
                        ];
                    }
                }
            }
            
            // Add progress output to a JSON file for tracking
            $progressFile = storage_path('app/public/downloads/progress_' . $videoId . '.json');
            
            // Add progress flags to ensure progress is shown
            // yt-dlp already outputs progress in a format we can parse
            $ytdlpCommand .= ' --progress --newline';
            
            // Create a unique download ID for this download
            $downloadId = $currentDownloadId ?? uniqid('dl_');
            
            // Store initial progress information
            $outputFilePath = "{$outputDir}/{$filename}.{$extension}";
            $progressData = [
                'id' => $downloadId,
                'video_id' => $videoId,
                'format' => $format,
                'format_id' => $actualFormatId,
                'status' => 'starting',
                'progress' => 0,
                'downloaded_bytes' => 0,
                'total_bytes' => 0,
                'eta' => 'unknown',
                'speed' => 'unknown',
                'output_file' => $outputFilePath,
                'started_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // Save initial progress data
            file_put_contents($progressFile, json_encode($progressData));
            
            // Create log files for yt-dlp output
            $errorLogFile = storage_path("logs/yt-dlp-error-{$downloadId}.log");
            $outputLogFile = storage_path("logs/yt-dlp-output-{$downloadId}.log");
            
            // Make sure the logs directory exists
            if (!file_exists(storage_path('logs'))) {
                mkdir(storage_path('logs'), 0755, true);
            }
            
            // Instead of using a shell script, we'll use Laravel's artisan command to monitor the progress
            // This allows us to use our improved PHP-based parsing logic
            
            // Update the progress data to include more information
            $progressData['status'] = 'downloading';
            $progressData['command'] = $ytdlpCommand;
            $progressData['output_log'] = $outputLogFile;
            $progressData['error_log'] = $errorLogFile;
            
            // Save updated progress data
            file_put_contents($progressFile, json_encode($progressData));
            
            // The monitor command will use our artisan command
            $monitorCommand = "php " . base_path('artisan') . " download:monitor {$downloadId} {$progressFile} %d > /dev/null 2>&1 & echo $!";
            
            Log::info("Will start monitor with command template: {$monitorCommand}");
            
            // Modify command to use nohup and redirect output to log files
            $ytdlpCommand = "nohup {$ytdlpCommand} > {$outputLogFile} 2> {$errorLogFile} & echo $!";
            
            // Execute the command asynchronously using Laravel's Process facade
            Log::info("Starting asynchronous download for video {$videoId} with format {$actualFormatId}");
            Log::info("Command: {$ytdlpCommand}");
            
            try {
                // Start the process and capture the PID
                $process = Process::start($ytdlpCommand);
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
            
            // Create JSON metadata file
            $metadataFile = "{$outputDir}/{$filename}.json";
            $metadata = [
                'id' => $videoId,
                'title' => $title,
                'channel' => $channelTitle,
                'description' => $description,
                'thumbnail' => $thumbnail,
                'duration' => $duration,
                'views' => $viewCount,
                'likes' => $likeCount,
                'comments' => $commentCount,
                'format' => $format,
                'format_id' => $actualFormatId,
                'downloaded_at' => date('Y-m-d H:i:s'),
                'url' => "https://www.youtube.com/watch?v={$videoId}"
            ];
            file_put_contents($metadataFile, json_encode($metadata, JSON_PRETTY_PRINT));
            
            // Create a download URL using the public route
            $downloadUrl = url("/tools/media/download/{$filename}.{$extension}");
            
            // Since we're downloading asynchronously, we don't have the file size yet
            // We'll return the download ID so the frontend can check progress
            return [
                'success' => true,
                'message' => 'Video download started',
                'download' => [
                    'url' => $downloadUrl,
                    'filename' => "{$filename}.{$extension}",
                    'mime_type' => $mimeType,
                    'expires_in' => 3600 // Link expires in 1 hour
                ],
                'video' => [
                    'id' => $videoId,
                    'title' => $title,
                    'thumbnail' => $thumbnail,
                    'duration' => $duration,
                    'author' => $channelTitle,
                    'views' => $viewCount
                ],
                'progress' => [
                    'download_id' => $downloadId,
                    'status' => 'downloading',
                    'progress' => 100
                ]
            ];
            
        } catch (\Exception $e) {
            Log::error("Failed to download video: " . $e->getMessage());
            throw new \Exception('Failed to download video: ' . $e->getMessage());
        }
    }
    
    /**
     * Determine the actual format ID to use for downloading based on the cached format output
     *
     * @param array $formatOutput
     * @param string $format
     * @param string $formatId
     * @return string
     */
    private function determineActualFormatId($formatOutput, $format, $formatId)
    {
        Log::info("Determining format ID. Format: {$format}, Format ID: {$formatId}");
        
        // Check if format contains a specific format ID (mp4_123)
        if (preg_match('/mp4_(\d+(?:-\w+)?)/', $format, $matches)) {
            $extractedFormatId = $matches[1];
            Log::info("Extracted format ID from format value: {$extractedFormatId}");
            // Always include audio by returning the format ID with +bestaudio
            // This ensures we get both video and audio
            return "{$extractedFormatId}+bestaudio";
        }
        
        // If formatId is a specific format ID and it's numeric, use it directly
        if (is_numeric($formatId)) {
            Log::info("Using numeric format ID directly: {$formatId}");
            return $formatId;
        }
        
        // Determine quality based on format
        $desiredQuality = '';
        switch ($format) {
            case 'mp4_4k':
                $desiredQuality = '4k';
                break;
            case 'mp4_2k':
                $desiredQuality = '2k';
                break;
            case 'mp4_fhd':
                $desiredQuality = 'fhd';
                break;
            case 'mp4_hd':
                $desiredQuality = 'hd';
                break;
            case 'mp4_sd':
                $desiredQuality = 'sd';
                break;
            case 'mp3_audio':
                Log::info("Using best audio format");
                return 'bestaudio[ext=m4a]/bestaudio';
            default:
                $desiredQuality = 'best';
        }
        
        Log::info("Determined desired quality: {$desiredQuality}");
        
        // Find the best format ID based on desired quality
        $bestFormatId = $this->findBestFormatId($formatOutput, $desiredQuality);
        
        if (!$bestFormatId) {
            // If no specific format found, use a safe default
            Log::warning("No specific format found, using 'best'");
            return 'best';
        }
        
        Log::info("Selected best format ID: {$bestFormatId}");
        return $bestFormatId;
    }
    
    /**
     * Find the best format ID from the available formats based on desired quality
     * Improved to better identify formats with both audio and video
     *
     * @param array $formatOutput
     * @param string $desiredQuality
     * @return string|null
     */
    private function findBestFormatId($formatOutput, $desiredQuality)
    {
        $videoFormats = [];
        $audioFormats = [];
        $combinedFormats = []; // Formats that contain both video and audio
        $formatStarted = false;
        
        // Ensure formatOutput is an array of strings
        if (!is_array($formatOutput)) {
            Log::warning("Format output is not an array, using default format selection");
            return 'best';
        }
        
        // Parse the format output to extract available formats
        foreach ($formatOutput as $line) {
            // Skip if not a string
            if (!is_string($line)) {
                continue;
            }
            
            // Skip lines until we reach the format table
            if (strpos($line, 'ID') !== false && strpos($line, 'EXT') !== false) {
                $formatStarted = true;
                continue;
            }
            
            if (!$formatStarted) {
                continue;
            }
            
            // Skip empty lines
            if (trim($line) === '') {
                continue;
            }
            
            // Parse format line
            if (preg_match('/^(\d+)\s+(\w+)\s+(.+)$/', $line, $matches)) {
                $formatId = $matches[1];
                $extension = $matches[2];
                $description = $matches[3];
                
                // Categorize formats
                if (strpos($description, 'audio only') !== false) {
                    $audioFormats[] = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'description' => $description
                    ];
                } else {
                    // Extract resolution if available
                    $resolution = 0;
                    if (preg_match('/([0-9]+)x([0-9]+)/', $description, $resParts)) {
                        $resolution = (int)$resParts[2]; // Use height as resolution indicator
                    } elseif (preg_match('/([0-9]+)p/', $description, $resParts)) {
                        $resolution = (int)$resParts[1];
                    }
                    
                    $format = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'description' => $description,
                        'resolution' => $resolution,
                        'has_audio' => strpos(strtolower($description), 'video only') === false // If not explicitly 'video only', it likely has audio
                    ];
                    
                    $videoFormats[] = $format;
                    
                    // If this format has both video and audio, add it to combined formats
                    if ($format['has_audio']) {
                        $combinedFormats[] = $format;
                    }
                }
            }
        }
        
        // Sort video formats by resolution (high to low)
        usort($videoFormats, function($a, $b) {
            return $b['resolution'] - $a['resolution'];
        });
        
        // Sort combined formats by resolution (high to low)
        usort($combinedFormats, function($a, $b) {
            return $b['resolution'] - $a['resolution'];
        });
        
        // Log format information for debugging
        Log::info("Found " . count($videoFormats) . " video formats, " . count($audioFormats) . " audio formats, and " . count($combinedFormats) . " combined formats");
        
        // Find the best format based on desired quality
        switch ($desiredQuality) {
            case 'ultra':
            case '4k':
                // First try to find 4K format with audio (2160p)
                foreach ($combinedFormats as $format) {
                    if ($format['resolution'] >= 2160) {
                        Log::info("Selected 4K format with audio: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // If no combined 4K format, return the best video format ID
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] >= 2160) {
                        Log::info("Selected 4K format (may need audio): " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // Fall back to highest available resolution
                return !empty($videoFormats) ? $videoFormats[0]['id'] : 'best';
                
            case '2k':
                // First try to find 2K format with audio (1440p)
                foreach ($combinedFormats as $format) {
                    if ($format['resolution'] >= 1440 && $format['resolution'] < 2160) {
                        Log::info("Selected 2K format with audio: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // If no combined 2K format, return the best video format ID
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] >= 1440 && $format['resolution'] < 2160) {
                        Log::info("Selected 2K format (may need audio): " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // Fall back to highest available resolution below 2K
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] < 2160) {
                        Log::info("Selected fallback for 2K: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                return !empty($videoFormats) ? $videoFormats[0]['id'] : 'best';
                
            case 'fhd':
                // First try to find FHD format with audio (1080p)
                foreach ($combinedFormats as $format) {
                    if ($format['resolution'] >= 1080 && $format['resolution'] < 1440) {
                        Log::info("Selected FHD format with audio: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // If no combined FHD format, return the best video format ID
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] >= 1080 && $format['resolution'] < 1440) {
                        Log::info("Selected FHD format (may need audio): " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // Fall back to highest available resolution below FHD
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] < 1440) {
                        Log::info("Selected fallback for FHD: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                return !empty($videoFormats) ? $videoFormats[0]['id'] : 'best';
                
            case 'hd':
                // First try to find HD format with audio (720p)
                foreach ($combinedFormats as $format) {
                    if ($format['resolution'] >= 720 && $format['resolution'] < 1080) {
                        Log::info("Selected HD format with audio: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // If no combined HD format, return the best video format ID
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] >= 720 && $format['resolution'] < 1080) {
                        Log::info("Selected HD format (may need audio): " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // Fall back to highest available resolution below HD
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] < 1080) {
                        Log::info("Selected fallback for HD: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                return !empty($videoFormats) ? $videoFormats[0]['id'] : 'best';
                
            case 'sd':
                // First try to find SD format with audio (480p or close)
                foreach ($combinedFormats as $format) {
                    if ($format['resolution'] <= 480 && $format['resolution'] >= 360) {
                        Log::info("Selected SD format with audio: " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // If no combined SD format, return the best video format ID
                foreach ($videoFormats as $format) {
                    if ($format['resolution'] <= 480 && $format['resolution'] >= 360) {
                        Log::info("Selected SD format (may need audio): " . $format['id'] . " - " . $format['description']);
                        return $format['id'];
                    }
                }
                
                // Fall back to lowest available resolution
                return !empty($videoFormats) ? end($videoFormats)['id'] : 'best';
                
            case 'audio':
                // Find best audio format
                if (!empty($audioFormats)) {
                    Log::info("Selected audio format: " . $audioFormats[0]['id'] . " - " . $audioFormats[0]['description']);
                    return $audioFormats[0]['id'];
                }
                return 'bestaudio';
                
            default: // 'best'
                // First try to return the highest quality combined format
                if (!empty($combinedFormats)) {
                    Log::info("Selected best combined format: " . $combinedFormats[0]['id'] . " - " . $combinedFormats[0]['description']);
                    return $combinedFormats[0]['id'];
                }
                
                // Fall back to highest quality video format
                if (!empty($videoFormats)) {
                    Log::info("Selected best video format (may need audio): " . $videoFormats[0]['id'] . " - " . $videoFormats[0]['description']);
                    return $videoFormats[0]['id'];
                }
                
                return 'best';
        }
    }
    
    /**
     * Get video details from YouTube API
     *
     * @param string $videoId
     * @return array
     * @throws \Exception
     */
    private function getVideoDetailsFromApi($videoId)
    {
        // Get API key from environment
        $apiKey = env('YOUTUBE_API_KEY');
        if (empty($apiKey)) {
            throw new \Exception('YouTube API key not configured');
        }
        
        // Use YouTube Data API to get video details
        $apiUrl = "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&key={$apiKey}&part=snippet,contentDetails,statistics";
        $response = Http::get($apiUrl);
        
        if (!$response->successful()) {
            Log::error('YouTube API error: ' . $response->body());
            throw new \Exception('Failed to get video information from YouTube API');
        }
        
        $data = $response->json();
        
        // Check if video exists
        if (empty($data['items'])) {
            throw new \Exception('Video not found on YouTube');
        }
        
        return $data['items'][0];
    }
    
    /**
     * Get cached formats for a YouTube video
     *
     * @param string $videoId
     * @return array|null
     */
    public function getCachedFormats($videoId)
    {
        $cacheKey = "youtube_formats_{$videoId}";
        $cachedOutput = cache()->get($cacheKey);
        
        if (!$cachedOutput) {
            Log::info("No cached formats found for video ID: {$videoId}");
            return null;
        }
        
        Log::info("Found cached formats for video ID: {$videoId}");
        
        // Get video details from API or use cached details
        try {
            $videoDetails = $this->getVideoDetailsFromApi($videoId);
            $title = $videoDetails['snippet']['title'] ?? "YouTube Video {$videoId}";
            $duration = isset($videoDetails['contentDetails']['duration']) ? $this->formatDuration($videoDetails['contentDetails']['duration']) : 'Unknown';
            $viewCount = $videoDetails['statistics']['viewCount'] ?? '0';
        } catch (\Exception $e) {
            Log::warning("Could not get video details from API, using defaults: {$e->getMessage()}");
            $title = "YouTube Video {$videoId}";
            $duration = 'Unknown';
            $viewCount = '0';
        }
        
        // Generate formats from cached output
        $formats = $this->generateGenericFormats($cachedOutput, $videoId, $title, $duration, $viewCount);
        
        // If no formats were found, fall back to predefined formats
        if (empty($formats)) {
            Log::warning("No formats could be generated from cached output, using predefined formats");
            return $this->getPredefinedFormats($videoId, $title, $duration, $viewCount);
        }
        
        return $formats;
    }
    
    /**
     * Get YouTube video formats using yt-dlp
     *
     * @param string $url
     * @return array
     */
    public function getFormats($url)
    {
        try {
            // Extract video ID from URL
            $videoId = $this->extractVideoId($url);
            if (!$videoId) {
                throw new \Exception('Invalid YouTube URL');
            }
            
            // Check if we have cached formats first
            $cachedFormats = $this->getCachedFormats($videoId);
            if ($cachedFormats && !empty($cachedFormats)) {
                Log::info("Using cached formats for video ID: {$videoId}");
                return $cachedFormats;
            }
            
            // Get API key from environment
            $apiKey = env('YOUTUBE_API_KEY');
            if (empty($apiKey)) {
                throw new \Exception('YouTube API key not configured');
            }
            
            // Use YouTube Data API to get video details
            $apiUrl = "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&key={$apiKey}&part=snippet,contentDetails,statistics";
            $response = Http::get($apiUrl);
            
            if (!$response->successful()) {
                Log::error('YouTube API error: ' . $response->body());
                throw new \Exception('Failed to get video information from YouTube API');
            }
            
            $data = $response->json();
            
            // Check if video exists
            if (empty($data['items'])) {
                throw new \Exception('Video not found on YouTube');
            }
            
            $videoData = $data['items'][0];
            $snippet = $videoData['snippet'] ?? [];
            $contentDetails = $videoData['contentDetails'] ?? [];
            $statistics = $videoData['statistics'] ?? [];
            
            $title = $snippet['title'] ?? "YouTube Video {$videoId}";
            $duration = isset($contentDetails['duration']) ? $this->formatDuration($contentDetails['duration']) : 'Unknown';
            $viewCount = $statistics['viewCount'] ?? '0';
            
            // Get available formats using yt-dlp with --skip-download and filter for mp4 only
            $command = "yt-dlp -F 'https://www.youtube.com/watch?v={$videoId}' --no-playlist --skip-download";
            $output = [];
            $returnCode = 0;
            
            Log::info("Executing format listing command: {$command}");
            exec($command, $output, $returnCode);
            
            if ($returnCode !== 0) {
                Log::error("yt-dlp format listing failed: " . implode("\n", $output));
                // Fall back to predefined formats
                return $this->getPredefinedFormats($videoId, $title, $duration, $viewCount);
            }
            
            // Store the raw format output in the cache for later use
            $cacheKey = "youtube_formats_{$videoId}";
            cache()->put($cacheKey, $output, now()->addHours(1)); // Cache for 1 hour
            
            // Generate simplified generic formats
            $formats = $this->generateGenericFormats($output, $videoId, $title, $duration, $viewCount);
            
            // If no formats were found, fall back to predefined formats
            if (empty($formats)) {
                return $this->getPredefinedFormats($videoId, $title, $duration, $viewCount);
            }
            
            return $formats;
            
        } catch (\Exception $e) {
            Log::error('Error getting video formats: ' . $e->getMessage());
            // Return predefined formats as fallback
            return $this->getPredefinedFormats($videoId ?? '', $title ?? "YouTube Video", $duration ?? 'Unknown', $viewCount ?? '0');
        }
    }
    
    /**
     * Parse yt-dlp format output
     *
     * @param array $output
     * @param string $videoId
     * @param string $title
     * @param string $duration
     * @param string $viewCount
     * @return array
     */
    private function parseYtDlpFormats($output, $videoId, $title, $duration, $viewCount)
    {
        $formats = [];
        $videoFormats = [];
        $audioFormats = [];
        $combinedFormats = [];
        $formatStarted = false;
        
        // Debug: Log the first few lines of output to understand the format
        $debugOutput = array_slice($output, 0, 10);
        Log::info("First 10 lines of yt-dlp output: " . implode("\n", $debugOutput));
        
        // More flexible format detection
        $formatTableStarted = false;
        
        foreach ($output as $line) {
            // Check for format table header in different possible formats
            if (!$formatTableStarted && 
                (strpos($line, 'ID') !== false && strpos($line, 'EXT') !== false) || 
                (strpos($line, 'format code') !== false)) {
                $formatTableStarted = true;
                Log::info("Format table detected at line: {$line}");
                continue;
            }
            
            if (!$formatTableStarted) {
                continue;
            }
            
            // Skip empty lines or lines with only dashes/separators
            if (trim($line) === '' || preg_match('/^[-]+$/', trim($line))) {
                continue;
            }
            
            // Debug: Log each format line being processed
            Log::info("Processing format line: {$line}");
            
            // Parse format line with more flexible regex
            // Match format ID at the beginning of the line
            if (preg_match('/^(\d+(?:-\w+)?)\s+([\w\d]+)\s+(.*)$/', $line, $matches)) {
                $formatId = $matches[1];
                $extension = $matches[2];
                $description = $matches[3] ?? '';
                
                // Extract resolution from description
                $resolution = 'Unknown';
                if (preg_match('/\b(\d+x\d+)\b/', $description, $resMatches)) {
                    $resolution = $resMatches[1];
                }
                
                // Extract file size if available
                $size = 'Unknown';
                if (preg_match('/\b(\d+(?:\.\d+)?(?:KiB|MiB|GiB))\b/', $description, $sizeMatches)) {
                    $size = $sizeMatches[1];
                } else if (preg_match('/~\s*(\d+(?:\.\d+)?(?:KiB|MiB|GiB))\b/', $description, $sizeMatches)) {
                    $size = $sizeMatches[1];
                }
                
                // Determine quality based on resolution
                $quality = 'standard';
                $isHighRes = false;
                
                // Check for 4K resolution (3840x2160 or 2160p)
                if (strpos($resolution, '2160') !== false || strpos($resolution, '3840x2160') !== false || strpos($resolution, '4K') !== false) {
                    $quality = 'ultra';
                    $isHighRes = true;
                }
                // Check for 1440p resolution (2K)
                else if (strpos($resolution, '1440') !== false || strpos($resolution, '2560x1440') !== false || strpos($resolution, '2K') !== false) {
                    $quality = 'very-high';
                    $isHighRes = true;
                }
                // Check for 1080p resolution (Full HD)
                else if (strpos($resolution, '1080') !== false || strpos($resolution, '1920x1080') !== false) {
                    $quality = 'high';
                    $isHighRes = true;
                }
                // Check for 720p resolution (HD)
                else if (strpos($resolution, '720') !== false || strpos($resolution, '1280x720') !== false) {
                    $quality = 'high';
                    $isHighRes = true;
                }
                // Check for 480p resolution (SD)
                else if (strpos($resolution, '480') !== false || strpos($resolution, '854x480') !== false) {
                    $quality = 'medium';
                }
                // Check for 360p resolution (Low)
                else if (strpos($resolution, '360') !== false || strpos($resolution, '640x360') !== false) {
                    $quality = 'low';
                }
                
                // Create format label with size if available
                $label = "{$resolution} ({$extension})";
                
                // For 4K resolution, make it more prominent
                if (strpos($resolution, '2160') !== false || strpos($resolution, '3840x2160') !== false) {
                    $label = "4K {$resolution} ({$extension})";
                }
                
                // Add size to label if available
                if ($size !== 'Unknown') {
                    $label .= " - {$size}";
                }
                
                // For audio-only formats
                $isAudioOnly = strpos($description, 'audio only') !== false;
                $isVideoOnly = strpos($description, 'video only') !== false;
                
                if ($isAudioOnly) {
                    $label = "Audio Only ({$extension})";
                    $quality = 'standard';
                    $isHighRes = false;
                    
                    // Add to audio formats list
                    $audioFormats[] = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'description' => $description
                    ];
                } else if (!$isVideoOnly && strpos($resolution, 'x') !== false) {
                    // This is likely a combined format (has both video and audio)
                    $combinedFormats[] = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'description' => $description,
                        'resolution' => $resolution,
                        'size' => $size,
                        'has_audio' => true
                    ];
                } else if ($isVideoOnly) {
                    // Extract resolution height if available
                    $height = 0;
                    if (preg_match('/\b(\d+)x(\d+)\b/', $resolution, $resParts)) {
                        $height = (int)$resParts[2];
                    }
                    
                    // Add to video formats list
                    $videoFormats[] = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'description' => $description,
                        'resolution' => $resolution,
                        'size' => $size,
                        'height' => $height,
                        'has_audio' => false
                    ];
                }
                
                // Add format to the main formats list
                $formats[] = [
                    'label' => $label,
                    'value' => "{$extension}_{$formatId}",
                    'quality' => $quality,
                    'size' => $size,
                    'url' => "https://www.youtube.com/watch?v={$videoId}",
                    'videoId' => $videoId,
                    'title' => $title,
                    'duration' => $duration,
                    'views' => $viewCount
                ];
            }
        }
        
        // Sort video formats by resolution (high to low)
        usort($videoFormats, function($a, $b) {
            return $b['height'] - $a['height'];
        });
        
        // Sort formats by quality (high to low)
        usort($formats, function($a, $b) {
            $qualityOrder = ['ultra' => 5, 'very-high' => 4, 'high' => 3, 'medium' => 2, 'low' => 1, 'standard' => 0];
            
            // Ensure quality values exist in the quality order array
            $qualityA = isset($qualityOrder[$a['quality']]) ? $qualityOrder[$a['quality']] : 0;
            $qualityB = isset($qualityOrder[$b['quality']]) ? $qualityOrder[$b['quality']] : 0;
            
            return $qualityB - $qualityA;
        });
        
        // Log format counts for debugging
        Log::info("Found " . count($videoFormats) . " video formats, " . count($audioFormats) . " audio formats, and " . count($combinedFormats) . " combined formats");
        
        // If we found any formats, use them
        if (!empty($formats)) {
            return $formats;
        }
        
        // If no formats were found, return predefined formats
        return $this->getPredefinedFormats($videoId, $title, $duration, $viewCount);
    }
    
    /**
     * Generate generic formats from yt-dlp output
     * 
     * @param array $output
     * @param string $videoId
     * @param string $title
     * @param string $duration
     * @param string $viewCount
     * @return array
     */
    private function generateGenericFormats($output, $videoId, $title, $duration, $viewCount)
    {
        // Initialize format containers
        $formats = [];
        $mp4Formats = [];
        $audioFormats = [];
        
        // Debug: Log the first few lines of output
        $debugOutput = array_slice($output, 0, 10);
        Log::info("First 10 lines of yt-dlp output: " . implode("\n", $debugOutput));
        
        // Format table detection
        $formatTableStarted = false;
        
        // Process each line of output
        foreach ($output as $line) {
            // Detect format table header
            if (!$formatTableStarted && 
                ((strpos($line, 'ID') !== false && strpos($line, 'EXT') !== false) || 
                (strpos($line, 'format code') !== false))) {
                $formatTableStarted = true;
                continue;
            }
            
            if (!$formatTableStarted) {
                continue;
            }
            
            // Skip empty lines or separator lines
            if (trim($line) === '' || preg_match('/^[-]+$/', trim($line))) {
                continue;
            }
            
            // Parse format line
            if (preg_match('/^(\d+(?:-\w+)?)\s+(\w+)\s+(.*)$/', $line, $matches)) {
                $formatId = $matches[1];
                $extension = $matches[2];
                $description = $matches[3] ?? '';
                
                // Skip non-mp4 formats except for audio
                $isAudioOnly = strpos($description, 'audio only') !== false;
                if ($extension !== 'mp4' && !$isAudioOnly) {
                    continue;
                }
                
                // Extract resolution
                $resolution = 'Unknown';
                $height = 0;
                if (preg_match('/\b(\d+x\d+)\b/', $description, $resMatches)) {
                    $resolution = $resMatches[1];
                    if (preg_match('/\b(\d+)x(\d+)\b/', $resolution, $resParts)) {
                        $height = (int)$resParts[2];
                    }
                }
                
                // Extract file size
                $size = 'Unknown';
                if (preg_match('/\b(\d+(?:\.\d+)?(?:KiB|MiB|GiB))\b/', $description, $sizeMatches)) {
                    $size = $sizeMatches[1];
                } else if (preg_match('/~\s*(\d+(?:\.\d+)?(?:KiB|MiB|GiB))\b/', $description, $sizeMatches)) {
                    $size = $sizeMatches[1];
                }
                
                // For audio-only formats, only keep mp3 or m4a
                if ($isAudioOnly) {
                    if ($extension === 'm4a' || $extension === 'mp3') {
                        $audioFormats[] = [
                            'id' => $formatId,
                            'extension' => $extension,
                            'size' => $size,
                            'height' => 0,
                            'is_audio_only' => true
                        ];
                    }
                } else {
                    // For video formats, store by height
                    $mp4Formats[] = [
                        'id' => $formatId,
                        'extension' => $extension,
                        'resolution' => $resolution,
                        'size' => $size,
                        'height' => $height,
                        'is_audio_only' => false
                    ];
                }
            }
        }
        
        // Sort video formats by height (highest first)
        usort($mp4Formats, function($a, $b) {
            return $b['height'] - $a['height'];
        });
        
        // Group formats by quality category
        $formatsByQuality = [
            '4k' => null,    // 2160p+
            '2k' => null,    // 1440p
            'fhd' => null,   // 1080p
            'hd' => null,    // 720p
            'sd' => null     // 480p and below
        ];
        
        // Find best format for each quality category
        foreach ($mp4Formats as $format) {
            $height = $format['height'];
            
            if ($height >= 2160 && $formatsByQuality['4k'] === null) {
                $formatsByQuality['4k'] = $format;
            } else if ($height >= 1440 && $height < 2160 && $formatsByQuality['2k'] === null) {
                $formatsByQuality['2k'] = $format;
            } else if ($height >= 1080 && $height < 1440 && $formatsByQuality['fhd'] === null) {
                $formatsByQuality['fhd'] = $format;
            } else if ($height >= 720 && $height < 1080 && $formatsByQuality['hd'] === null) {
                $formatsByQuality['hd'] = $format;
            } else if ($height >= 360 && $height < 720 && $formatsByQuality['sd'] === null) {
                $formatsByQuality['sd'] = $format;
            }
        }
        
        // Create the final format list
        // 4K
        if ($formatsByQuality['4k'] !== null) {
            $format = $formatsByQuality['4k'];
            $formats[] = [
                'label' => '4K (' . $format['resolution'] . ') - ' . $format['size'],
                'value' => 'mp4_' . $format['id'],
                'quality' => '4k',
                'size' => $format['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $format['id']
            ];
        }
        
        // 2K
        if ($formatsByQuality['2k'] !== null) {
            $format = $formatsByQuality['2k'];
            $formats[] = [
                'label' => '2K (' . $format['resolution'] . ') - ' . $format['size'],
                'value' => 'mp4_' . $format['id'],
                'quality' => '2k',
                'size' => $format['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $format['id']
            ];
        }
        
        // FHD (1080p)
        if ($formatsByQuality['fhd'] !== null) {
            $format = $formatsByQuality['fhd'];
            $formats[] = [
                'label' => 'Full HD (' . $format['resolution'] . ') - ' . $format['size'],
                'value' => 'mp4_' . $format['id'],
                'quality' => 'fhd',
                'size' => $format['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $format['id']
            ];
        }
        
        // HD (720p)
        if ($formatsByQuality['hd'] !== null) {
            $format = $formatsByQuality['hd'];
            $formats[] = [
                'label' => 'HD (' . $format['resolution'] . ') - ' . $format['size'],
                'value' => 'mp4_' . $format['id'],
                'quality' => 'hd',
                'size' => $format['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $format['id']
            ];
        }
        
        // SD (480p and below)
        if ($formatsByQuality['sd'] !== null) {
            $format = $formatsByQuality['sd'];
            $formats[] = [
                'label' => 'SD (' . $format['resolution'] . ') - ' . $format['size'],
                'value' => 'mp4_' . $format['id'],
                'quality' => 'sd',
                'size' => $format['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $format['id']
            ];
        }
        
        // Audio only
        if (!empty($audioFormats)) {
            // Sort by size (largest first for best quality)
            usort($audioFormats, function($a, $b) {
                $sizeA = $this->convertSizeToBytes($a['size']);
                $sizeB = $this->convertSizeToBytes($b['size']);
                return $sizeB - $sizeA;
            });
            
            $bestAudio = $audioFormats[0];
            $formats[] = [
                'label' => 'Audio Only (WEBM) - ' . $bestAudio['size'],
                'value' => 'mp3_audio',
                'quality' => 'audio',
                'size' => $bestAudio['size'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => $bestAudio['id']
            ];
        }
        
        // If no formats were found, return predefined formats
        if (empty($formats)) {
            return $this->getPredefinedFormats($videoId, $title, $duration, $viewCount);
        }
        
        return $formats;
    }
    
    /**
     * Convert size string (like 10.5MiB) to bytes
     *
     * @param string $sizeStr
     * @return int
     */
    private function convertSizeToBytes($sizeStr)
    {
        if ($sizeStr === 'Unknown') {
            return 0;
        }
        
        $units = ['B' => 1, 'KiB' => 1024, 'MiB' => 1024*1024, 'GiB' => 1024*1024*1024];
        
        if (preg_match('/^([\d\.]+)\s*(B|KiB|MiB|GiB)$/', $sizeStr, $matches)) {
            $size = (float) $matches[1];
            $unit = $matches[2];
            
            if (isset($units[$unit])) {
                return round($size * $units[$unit]);
            }
        }
        
        return 0;
    }
    
    /**
     * Get predefined formats as fallback
     *
     * @param string $videoId
     * @param string $title
     * @param string $duration
     * @param string $viewCount
     * @return array
     */
    private function getPredefinedFormats($videoId, $title, $duration, $viewCount)
    {
        return [
            [
                'label' => '4K (2160p)',
                'value' => 'mp4_4k',
                'quality' => '4k',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'best'
            ],
            [
                'label' => '2K (1440p)',
                'value' => 'mp4_2k',
                'quality' => '2k',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'best'
            ],
            [
                'label' => 'Full HD (1080p)',
                'value' => 'mp4_fhd',
                'quality' => 'fhd',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'best'
            ],
            [
                'label' => 'HD (720p)',
                'value' => 'mp4_hd',
                'quality' => 'hd',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'best'
            ],
            [
                'label' => 'SD (480p)',
                'value' => 'mp4_sd',
                'quality' => 'sd',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'best'
            ],
            [
                'label' => 'Audio Only (WEBM)',
                'value' => 'mp3_audio',
                'quality' => 'audio',
                'size' => 'Unknown',
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'videoId' => $videoId,
                'title' => $title,
                'duration' => $duration,
                'views' => $viewCount,
                'id' => 'bestaudio'
            ]
        ];
    }
    
    /**
     * Get options for yt-dlp to bypass YouTube's anti-bot protection
     * 
     * This uses safer approaches that won't risk account bans:
     * - Proxy rotation (if configured)
     * - Rate limiting
     * - User agent rotation
     * - Optional proxy
     *
     * @return string
     */
    private function getProxyOption()
    {
        $options = [];
        
        // First try to get a proxy from ProxyManager service
        $randomProxy = $this->proxyManager->getRandomProxy();
        
        if (!empty($randomProxy)) {
            // Format: protocol://user:pass@host:port
            $options[] = "--proxy 'https://{$randomProxy}'";
            Log::info("Using proxy from ProxyManager for YouTube download: https://*****");
        }
        
        // Add rate limiting to appear less bot-like
        $options[] = '--limit-rate 1.5M';
        
        // Add random sleep between requests
        $options[] = '--sleep-requests 1';
        $options[] = '--sleep-interval 3';
        
        // Add retries for resilience
        $options[] = '--retries 3';
        
        // Add random user agent rotation
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 11.5; rv:90.0) Gecko/20100101 Firefox/90.0'
        ];
        $randomUserAgent = $userAgents[array_rand($userAgents)];
        $options[] = "--user-agent '{$randomUserAgent}'";
        
        // Add referer to appear more legitimate
        $options[] = "--referer 'https://www.google.com/'";
        
        return implode(' ', $options);
    }
    
    /**
     * Update download progress based on yt-dlp output
     *
     * @param string $progressFile Path to the progress file
     * @param string $output Output from yt-dlp
     * @param array $progressData Current progress data
     * @return void
     */
    private function updateDownloadProgress($progressFile, $output, &$progressData)
    {
        // Look for progress lines in the output
        $lines = explode("\n", $output);
        
        foreach ($lines as $line) {
            // Check if this is a progress line
            if (strpos($line, 'download:') === 0) {
                // Parse the progress data
                $parts = explode(':', trim($line), 4);
                
                if (count($parts) >= 4) {
                    $bytesPart = $parts[1];
                    $eta = $parts[2];
                    $speed = $parts[3];
                    
                    // Parse bytes information
                    $bytesInfo = explode('/', $bytesPart);
                    if (count($bytesInfo) == 2) {
                        $downloadedBytes = (float) $bytesInfo[0];
                        $totalBytes = (float) $bytesInfo[1];
                        
                        // Calculate progress percentage
                        $progress = 0;
                        if ($totalBytes > 0) {
                            $progress = round(($downloadedBytes / $totalBytes) * 100);
                        }
                        
                        // Update progress data
                        $progressData['status'] = 'downloading';
                        $progressData['progress'] = $progress;
                        $progressData['downloaded_bytes'] = $downloadedBytes;
                        $progressData['total_bytes'] = $totalBytes;
                        $progressData['eta'] = $eta;
                        $progressData['speed'] = $speed;
                        $progressData['updated_at'] = date('Y-m-d H:i:s');
                        
                        // Save updated progress
                        file_put_contents($progressFile, json_encode($progressData));
                        
                        // Log progress update
                        if ($progress % 10 == 0) { // Log every 10% to avoid excessive logging
                            Log::info("Download progress for video {$progressData['video_id']}: {$progress}% ({$speed})");
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Extract YouTube video ID from URL
     *
     * @param string $url
     * @return string|null
     */
    public function extractVideoId($url)
    {
        $pattern = '/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    /**
     * Format ISO 8601 duration to human-readable format
     *
     * @param string $isoDuration
     * @return string
     */
    private function formatDuration($isoDuration)
    {
        try {
            $interval = new \DateInterval($isoDuration);
            
            $hours = $interval->h + ($interval->d * 24);
            $minutes = $interval->i;
            $seconds = $interval->s;
            
            if ($hours > 0) {
                return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
            } else {
                return sprintf('%d:%02d', $minutes, $seconds);
            }
        } catch (\Exception $e) {
            return '0:00'; // Default duration if parsing fails
        }
    }
    
    /**
     * Map format to yt-dlp format code
     *
     * @param string $format
     * @param string $formatId
     * @return string
     */
    private function mapFormatToYtDlp($format, $formatId)
    {
        // Check if the format is a direct yt-dlp format ID
        if (is_numeric($formatId)) {
            return $formatId;
        }
        
        // Use extremely simple format codes that should work with any video
        switch ($format . '_' . $formatId) {
            case 'mp4_hd':
                return 'best'; // Just use the best available format
            case 'mp4_sd':
                return 'best'; // Just use the best available format
            case 'mp3_audio':
                return 'bestaudio'; // Best audio only
            default:
                // If format contains an underscore, it might be in the format "ext_formatId"
                $parts = explode('_', $format . '_' . $formatId);
                if (count($parts) >= 2 && is_numeric($parts[1])) {
                    return $parts[1]; // Return the numeric format ID
                }
                return 'best'; // Default to best available format
        }
    }
    
    /**
     * Get MIME type for file extension
     *
     * @param string $extension
     * @return string
     */
    private function getMimeTypeForExtension($extension)
    {
        $mimeTypes = [
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'mp3' => 'audio/mpeg',
            'm4a' => 'audio/mp4',
            'ogg' => 'audio/ogg',
            'opus' => 'audio/opus',
        ];
        
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
    
    /**
     * Cancel a download in progress
     *
     * @param string $downloadId
     * @return array
     */
    public function cancelDownload($downloadId)
    {
        Log::info("Cancelling download with ID: {$downloadId}");
        
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
                
                Log::info("Terminated download process with PID: {$pid}");
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
                
                Log::info("Terminated monitor process with PID: {$monitorPid}");
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
                Log::info("Deleted partial download file: {$outputFile}");
            }
        }
        
        return [
            'success' => true,
            'message' => 'Download cancelled successfully'
        ];
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

    
    private function findExistingDownload($filename): ?string
    {
        // Set download directory
        $downloadDir = storage_path('app/public/downloads');
        if (!file_exists($downloadDir)) {
            return null;
        }
        
        return file_exists($filename) ? $filename : null;
    }
}
