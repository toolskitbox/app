<?php

namespace App\Http\Controllers\Tools;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Services\VideoDownloader\VideoDownloaderService;

class MediaController extends Controller
{
    /**
     * Video downloader service
     *
     * @var VideoDownloaderService
     */
    protected $videoDownloaderService;

    /**
     * Constructor
     *
     * @param VideoDownloaderService $videoDownloaderService
     */
    public function __construct(VideoDownloaderService $videoDownloaderService)
    {
        $this->videoDownloaderService = $videoDownloaderService;
    }

    /**
     * Get video information from YouTube or DailyMotion URL
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVideoInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $url = $request->url;
        
        try {
            // Use the video downloader service to get video information
            $videoInfo = $this->videoDownloaderService->getVideoInfo($url);
            return response()->json($videoInfo);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch video information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a video from a URL
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function downloadVideo(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'url' => 'required|url',
                'format' => 'required|string',
                'format_id' => 'required|string',
            ]);
            
            $url = $validated['url'];
            $format = $validated['format'];
            $formatId = $validated['format_id'];
            
            // Use the video downloader service to download the video
            $downloadInfo = $this->videoDownloaderService->downloadVideo($url, $format, $formatId);
            return response()->json($downloadInfo);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to download video',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Serve a downloaded file
     * 
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\Response
     */
    public function serveDownload($filename)
    {
        // Get the file path
        $filePath = storage_path('app/public/downloads/' . $filename);
        
        // Check if the file exists
        if (!file_exists($filePath)) {
            // If the file doesn't exist, create a simulated file for demonstration purposes
            
            // Parse the filename to extract information
            $parts = explode('_', pathinfo($filename, PATHINFO_FILENAME));
            $platform = $parts[0] ?? 'unknown';
            $videoId = $parts[1] ?? 'unknown';
            $formatId = $parts[2] ?? 'unknown';
            
            // Determine the content type based on the file extension
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            if ($extension == 'mp4' || $extension == 'webm') {
                $contentType = "video/{$extension}";
            } else if ($extension == 'mp3') {
                $contentType = 'audio/mpeg';
            } else {
                $contentType = 'application/octet-stream';
            }
            
            // Create a simulated file with information about the download
            $content = "This is a simulated download for:\n";
            $content .= "Platform: {$platform}\n";
            $content .= "Video ID: {$videoId}\n";
            $content .= "Format ID: {$formatId}\n";
            $content .= "\nIn a production environment, this would be the actual video/audio file.";
            
            // Create a response with the content
            $response = response($content);
            $response->header('Content-Type', $contentType);
            $response->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            
            return $response;
        }
        
        // File exists, serve it directly
        return response()->download($filePath, $filename, [
            'Content-Type' => mime_content_type($filePath) ?: 'application/octet-stream'
        ]);
    }

    /**
     * Check the progress of a video download
     *
     * @param string $downloadId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkDownloadProgress($downloadId)
    {
        // Validate the download ID format
        if (!preg_match('/^dl_[a-f0-9]+$/', $downloadId)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid download ID format'
            ], 400);
        }
        
        // Look for progress files in the downloads directory
        $downloadsDir = storage_path('app/public/downloads');
        $progressFiles = glob("{$downloadsDir}/progress_*.json");
        
        foreach ($progressFiles as $progressFile) {
            // Read the progress data
            $progressData = json_decode(file_get_contents($progressFile), true);
            
            // Check if this is the requested download
            if (isset($progressData['id']) && $progressData['id'] === $downloadId) {
                // Prepare the response data
                $responseData = [
                    'success' => true,
                    'progress' => [
                        'download_id' => $progressData['id'],
                        'video_id' => $progressData['video_id'] ?? null,
                        'status' => $progressData['status'] ?? 'unknown',
                        'progress' => $progressData['progress'] ?? 0,
                        'downloaded_bytes' => $progressData['downloaded_bytes'] ?? 0,
                        'total_bytes' => $progressData['total_bytes'] ?? 0,
                        'eta' => $progressData['eta'] ?? 'unknown',
                        'speed' => $progressData['speed'] ?? 'unknown',
                        'started_at' => $progressData['started_at'] ?? null,
                        'updated_at' => $progressData['updated_at'] ?? null
                    ]
                ];
                
                // If download is completed, include the download URL
                if (isset($progressData['status']) && $progressData['status'] === 'completed') {
                    // Even if the filename is not in the progress data, try to find it
                    $filename = null;
                    
                    if (isset($progressData['filename'])) {
                        $filename = $progressData['filename'];
                    } elseif (isset($progressData['video_id'])) {
                        // Try to find the file based on the video ID
                        $videoId = $progressData['video_id'];
                        $downloadDir = storage_path('app/public/downloads');
                        
                        // Check for both YouTube and Dailymotion files
                        $possibleFiles = array_merge(
                            glob("{$downloadDir}/youtube_{$videoId}_*"),
                            glob("{$downloadDir}/dailymotion_{$videoId}_*")
                        );
                        
                        if (!empty($possibleFiles)) {
                            // Sort by modification time (newest first)
                            usort($possibleFiles, function($a, $b) {
                                return filemtime($b) - filemtime($a);
                            });
                            
                            // Get the most recent file
                            $latestFile = $possibleFiles[0];
                            $filename = basename($latestFile);
                            
                            // Update the progress data with the filename
                            $progressData['filename'] = $filename;
                            file_put_contents($progressFile, json_encode($progressData));
                            
                            Log::info("Found file for completed download: {$filename}");
                        }
                    }
                    
                    if ($filename) {
                        $extension = pathinfo($filename, PATHINFO_EXTENSION);
                        
                        // Determine the content type based on the file extension
                        if ($extension == 'mp4' || $extension == 'webm') {
                            $contentType = "video/{$extension}";
                        } else if ($extension == 'mp3') {
                            $contentType = 'audio/mpeg';
                        } else {
                            $contentType = 'application/octet-stream';
                        }
                        
                        // Get the actual file path
                        $filePath = storage_path('app/public/downloads/' . $filename);
                        
                        // Get the actual file size from the file on disk
                        $actualFileSize = file_exists($filePath) ? filesize($filePath) : 0;
                        
                        // Use the actual file size if available, otherwise fall back to the progress data
                        $fileSize = $actualFileSize > 0 ? $actualFileSize : ($progressData['total_bytes'] ?? 0);
                        
                        // Add download information to the response
                        $responseData['download'] = [
                            'url' => url("/tools/media/download/{$filename}"),
                            'filename' => $filename,
                            'mime_type' => $contentType,
                            'size' => $fileSize > 0 ? $this->formatBytes($fileSize) : 'Unknown',
                            'actual_size_bytes' => $actualFileSize,
                            'expires_in' => 86400 // 24 hours in seconds
                        ];
                        
                        // Update the progress data with the actual file size
                        if ($actualFileSize > 0 && (!isset($progressData['actual_file_size']) || $progressData['actual_file_size'] != $actualFileSize)) {
                            $progressData['actual_file_size'] = $actualFileSize;
                            $progressData['total_bytes'] = $actualFileSize; // Update total_bytes with the actual size
                            file_put_contents($progressFile, json_encode($progressData));
                            Log::info("Updated progress data with actual file size: {$actualFileSize} bytes for {$filename}");
                        }
                        
                        Log::info("Added download info to response for completed download: {$filename}");
                    } else {
                        Log::warning("Download marked as completed but no filename found for download ID: {$downloadId}");
                    }
                }
                
                return response()->json($responseData);
            }
        }
        
        // If we get here, the download ID was not found
        return response()->json([
            'success' => false,
            'message' => 'Download not found or completed'
        ], 404);
    }
    
    /**
     * Convert audio from one format to another
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function convertAudio(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'audio' => 'required|file|mimes:mp3,wav,ogg,aac,flac',
            'format' => 'required|string|in:mp3,wav,ogg,aac,flac',
            'bitrate' => 'nullable|integer|min:64|max:320'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Implementation would use an audio conversion library
        // For demonstration purposes, we'll return a mock response
        return response()->json([
            'message' => 'Audio conversion completed',
            'download_url' => '/storage/conversions/' . uniqid() . '.' . $request->format,
            'file_size' => rand(1, 20) . ' MB'
        ]);
    }

    /**
     * Process an image (resize, compress, convert)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|max:10240',
            'operation' => 'required|string|in:resize,compress,convert',
            'width' => 'nullable|integer|min:1|max:5000',
            'height' => 'nullable|integer|min:1|max:5000',
            'quality' => 'nullable|integer|min:1|max:100',
            'format' => 'nullable|string|in:jpg,jpeg,png,gif,webp,bmp'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store the uploaded image
            $path = $request->file('image')->store('temp');
            $fullPath = Storage::path($path);
            
            // Create image manager instance
            $manager = new ImageManager(new Driver());
            
            // Load image
            $image = $manager->read($fullPath);
            
            // Process based on operation
            switch ($request->operation) {
                case 'resize':
                    $image->resize($request->width, $request->height);
                    break;
                    
                case 'compress':
                    // Compression is handled at save time with quality parameter
                    break;
                    
                case 'convert':
                    // Format conversion is handled at save time
                    break;
            }
            
            // Determine output format
            $format = $request->format ?? pathinfo($request->file('image')->getClientOriginalName(), PATHINFO_EXTENSION);
            
            // Save the processed image
            $outputPath = 'processed/' . uniqid() . '.' . $format;
            $fullOutputPath = Storage::path($outputPath);
            
            // Ensure directory exists
            if (!file_exists(dirname($fullOutputPath))) {
                mkdir(dirname($fullOutputPath), 0755, true);
            }
            
            // Save with specified quality if provided
            $quality = $request->quality ?? 90;
            $image->save($fullOutputPath, $quality);
            
            // Return the download URL
            return response()->json([
                'message' => 'Image processed successfully',
                'download_url' => '/storage/' . $outputPath,
                'format' => $format,
                'width' => $image->width(),
                'height' => $image->height(),
                'size' => filesize($fullOutputPath) . ' bytes'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error processing image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert video from one format to another
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function convertVideo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'video' => 'required|file|mimes:mp4,avi,mov,wmv,flv,webm',
            'format' => 'required|string|in:mp4,avi,mov,wmv,flv,webm',
            'resolution' => 'nullable|string|in:360p,480p,720p,1080p,2k,4k',
            'framerate' => 'nullable|integer|min:15|max:60'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Implementation would use a video conversion library or FFmpeg
        // For demonstration purposes, we'll return a mock response
        return response()->json([
            'message' => 'Video conversion initiated',
            'download_url' => '/storage/video-conversions/' . uniqid() . '.' . $request->format,
            'estimated_time' => rand(30, 300) . ' seconds',
            'status' => 'processing'
        ]);
    }
    
    /**
     * Convert file from one format to another (PDF to DOC, DOC to PDF, etc.)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function convertFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'from_format' => 'required|string|in:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,rtf,html',
            'to_format' => 'required|string|in:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,rtf,html'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store the uploaded file
            $path = $request->file('file')->store('temp');
            
            // Implementation would use a file conversion library or API
            // For demonstration purposes, we'll return a mock response
            return response()->json([
                'message' => 'File conversion initiated',
                'download_url' => '/storage/file-conversions/' . uniqid() . '.' . $request->to_format,
                'original_filename' => $request->file('file')->getClientOriginalName(),
                'converted_filename' => pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME) . '.' . $request->to_format,
                'status' => 'processing'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error converting file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Cancel a video download in progress
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelDownload(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'download_id' => 'required|string',
            ]);
            
            $downloadId = $validated['download_id'];
            
            // Use the YouTube service to cancel the download
            $result = $this->videoDownloaderService->cancelDownload($downloadId);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel download',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Format bytes to human-readable format
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
}
