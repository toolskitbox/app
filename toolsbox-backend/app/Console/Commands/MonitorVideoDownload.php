<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class MonitorVideoDownload extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'download:monitor {downloadId} {progressFile} {processId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor a YouTube video download process and update progress';

    /**
     * Parse progress information from yt-dlp output log
     *
     * @param string $logContent The content of the log file
     * @param array &$progressData The progress data to update
     * @return void
     */
    private function parseProgressFromLog($logContent, &$progressData)
    {
        if (empty($logContent)) {
            return;
        }
        
        Log::debug("Parsing log content: " . substr($logContent, 0, 500) . "..."); // Log a sample of the content
        
        // Extract the most recent progress line from the log
        $lines = explode("\n", $logContent);
        $progressLines = [];
        
        // Collect all progress lines
        foreach ($lines as $line) {
            if (strpos($line, '[download]') !== false && strpos($line, '%') !== false) {
                $progressLines[] = $line;
            }
        }
        
        // If we found progress lines, use the most recent one
        if (!empty($progressLines)) {
            $lastProgressLine = end($progressLines);
            Log::debug("Processing progress line: {$lastProgressLine}");
            
            // Try to match the standard yt-dlp progress format with or without Unknown values
            if (preg_match('/\[download\]\s+([0-9\.]+)%\s+of\s+~?\s*([0-9\.]+)([KMG]iB)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/', $lastProgressLine, $matches)) {
                $progress = (float)$matches[1];
                $totalSize = (float)$matches[2];
                $sizeUnit = $matches[3];
                $speed = $matches[4];
                $eta = $matches[5];
                
                // Convert size to bytes based on unit
                $multiplier = 1;
                if ($sizeUnit === 'KiB') $multiplier = 1024;
                else if ($sizeUnit === 'MiB') $multiplier = 1024 * 1024;
                else if ($sizeUnit === 'GiB') $multiplier = 1024 * 1024 * 1024;
                
                $totalBytes = round($totalSize * $multiplier);
                $downloadedBytes = round($totalBytes * ($progress / 100));
                
                Log::debug("Found standard progress: {$progress}%, Size: {$totalSize}{$sizeUnit}, Speed: {$speed}, ETA: {$eta}");
                
                // Update progress data
                $progressData['downloaded_bytes'] = $downloadedBytes;
                $progressData['total_bytes'] = $totalBytes;
                $progressData['progress'] = round($progress);
                $progressData['eta'] = $eta === 'Unknown' ? 'Calculating...' : $eta;
                $progressData['speed'] = $speed === 'Unknown B/s' ? 'Calculating...' : $speed;
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                Log::debug("Updated progress from standard format: {$progress}%, Speed: {$speed}, ETA: {$eta}");
                
                // If we have a consistent file size and the progress is increasing, this is a good sign
                // Store the consistent file size for future reference
                if (!isset($progressData['consistent_file_size']) || $progressData['consistent_file_size'] === 0) {
                    $progressData['consistent_file_size'] = $totalBytes;
                    $progressData['consistent_file_size_str'] = "{$totalSize}{$sizeUnit}";
                }
            }
            // Try to match the format with Unknown speed/ETA values
            else if (preg_match('/\[download\]\s+([0-9\.]+)%\s+of\s+([0-9\.]+)([KMG]iB)\s+at\s+Unknown\s+B\/s\s+ETA\s+Unknown/', $lastProgressLine, $matches)) {
                $progress = (float)$matches[1];
                $totalSize = (float)$matches[2];
                $sizeUnit = $matches[3];
                
                // Convert size to bytes based on unit
                $multiplier = 1;
                if ($sizeUnit === 'KiB') $multiplier = 1024;
                else if ($sizeUnit === 'MiB') $multiplier = 1024 * 1024;
                else if ($sizeUnit === 'GiB') $multiplier = 1024 * 1024 * 1024;
                
                $totalBytes = round($totalSize * $multiplier);
                $downloadedBytes = round($totalBytes * ($progress / 100));
                
                Log::debug("Found progress with Unknown values: {$progress}%, Size: {$totalSize}{$sizeUnit}");
                
                // Update progress data
                $progressData['downloaded_bytes'] = $downloadedBytes;
                $progressData['total_bytes'] = $totalBytes;
                $progressData['progress'] = round($progress);
                $progressData['eta'] = 'Calculating...';
                $progressData['speed'] = 'Calculating...';
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                // Store the consistent file size for future reference
                if (!isset($progressData['consistent_file_size']) || $progressData['consistent_file_size'] === 0) {
                    $progressData['consistent_file_size'] = $totalBytes;
                    $progressData['consistent_file_size_str'] = "{$totalSize}{$sizeUnit}";
                }
                
                Log::debug("Updated progress from Unknown format: {$progress}%");
            }
            // Try to match the format with known speed and ETA values (no fragment info)
            else if (preg_match('/\[download\]\s+([0-9\.]+)%\s+of\s+([0-9\.]+)([KMG]iB)\s+at\s+([0-9\.]+)([KMG]iB\/s)\s+ETA\s+([0-9:]+)/', $lastProgressLine, $matches)) {
                $progress = (float)$matches[1];
                $totalSize = (float)$matches[2];
                $sizeUnit = $matches[3];
                $speed = $matches[4] . $matches[5];
                $eta = $matches[6];
                
                // Convert size to bytes based on unit
                $multiplier = 1;
                if ($sizeUnit === 'KiB') $multiplier = 1024;
                else if ($sizeUnit === 'MiB') $multiplier = 1024 * 1024;
                else if ($sizeUnit === 'GiB') $multiplier = 1024 * 1024 * 1024;
                
                $totalBytes = round($totalSize * $multiplier);
                $downloadedBytes = round($totalBytes * ($progress / 100));
                
                Log::debug("Found progress with known values: {$progress}%, Size: {$totalSize}{$sizeUnit}, Speed: {$speed}, ETA: {$eta}");
                
                // Update progress data
                $progressData['downloaded_bytes'] = $downloadedBytes;
                $progressData['total_bytes'] = $totalBytes;
                $progressData['progress'] = round($progress);
                $progressData['eta'] = $eta;
                $progressData['speed'] = $speed;
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                // Store the consistent file size for future reference
                if (!isset($progressData['consistent_file_size']) || $progressData['consistent_file_size'] === 0) {
                    $progressData['consistent_file_size'] = $totalBytes;
                    $progressData['consistent_file_size_str'] = "{$totalSize}{$sizeUnit}";
                }
                
                Log::debug("Updated progress from known format: {$progress}%, Speed: {$speed}, ETA: {$eta}");
            }
            // Try to match the format with fragment information
            else if (preg_match('/\[download\]\s+([0-9\.]+)%.*?\(frag\s+(\d+)\/(\d+)\)/', $lastProgressLine, $matches)) {
                $progress = (float)$matches[1];
                $currentFrag = (int)$matches[2];
                $totalFrags = (int)$matches[3];
                
                // Extract speed and ETA if available
                $speed = 'Unknown';
                $eta = 'Unknown';
                if (preg_match('/at\s+([^\s]+)\s+ETA\s+([^\s]+)/', $lastProgressLine, $etaMatches)) {
                    $speed = $etaMatches[1];
                    $eta = $etaMatches[2];
                }
                
                // Extract file size if available
                $totalBytes = 0;
                $downloadedBytes = 0;
                if (preg_match('/of\s+~?\s*([0-9\.]+)([KMG]iB)/', $lastProgressLine, $sizeMatches)) {
                    $totalSize = (float)$sizeMatches[1];
                    $sizeUnit = $sizeMatches[2];
                    
                    // Convert size to bytes based on unit
                    $multiplier = 1;
                    if ($sizeUnit === 'KiB') $multiplier = 1024;
                    else if ($sizeUnit === 'MiB') $multiplier = 1024 * 1024;
                    else if ($sizeUnit === 'GiB') $multiplier = 1024 * 1024 * 1024;
                    
                    $totalBytes = round($totalSize * $multiplier);
                    $downloadedBytes = round($totalBytes * ($progress / 100));
                }
                
                Log::debug("Found fragment progress: {$progress}%, Fragment: {$currentFrag}/{$totalFrags}, Speed: {$speed}, ETA: {$eta}");
                
                // Update progress data
                $progressData['downloaded_bytes'] = $downloadedBytes;
                $progressData['total_bytes'] = $totalBytes;
                $progressData['progress'] = round($progress);
                $progressData['current_fragment'] = $currentFrag;
                $progressData['total_fragments'] = $totalFrags;
                $progressData['eta'] = $eta;
                $progressData['speed'] = $speed;
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                Log::debug("Updated progress from fragment format: {$progress}%, Fragment: {$currentFrag}/{$totalFrags}");
            }
            // Look for download progress lines using our custom template format (legacy support)
            else if (preg_match('/download:([0-9]+)\/([0-9]+):([^:]+):([^\n]+)/', $lastProgressLine, $matches)) {
                $downloadedBytes = (int)$matches[1];
                $totalBytes = (int)$matches[2];
                $eta = trim($matches[3]);
                $speed = trim($matches[4]);
                
                Log::debug("Found custom progress data: {$downloadedBytes}/{$totalBytes}, ETA: {$eta}, Speed: {$speed}");
                
                // Calculate progress percentage
                $progress = 0;
                if ($totalBytes > 0) {
                    $progress = round(($downloadedBytes / $totalBytes) * 100);
                }
                
                // Update progress data
                $progressData['downloaded_bytes'] = $downloadedBytes;
                $progressData['total_bytes'] = $totalBytes;
                $progressData['progress'] = $progress;
                $progressData['eta'] = $eta;
                $progressData['speed'] = $speed;
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                Log::debug("Updated progress from custom format: {$progress}%, Speed: {$speed}, ETA: {$eta}");
            }
        }
        
        // Look for download completion - only mark as complete if we see final completion indicators
        // We need to be more careful about marking downloads as complete
        if ((strpos($logContent, 'Merging formats into') !== false && strpos($logContent, 'Merged into') !== false) || 
            strpos($logContent, 'has already been downloaded and merged') !== false || 
            (strpos($logContent, '[download] 100%') !== false && strpos($logContent, 'Destination: ') !== false && 
             (strpos($logContent, 'Deleting original file') !== false || 
              preg_match('/\[ffmpeg\] Merging formats into.*Done/', $logContent)))) {
              
            // Also check if we have a progress of 100% in the progress data
            if (isset($progressData['progress']) && $progressData['progress'] >= 99) {
                $progressData['progress'] = 100;
                $progressData['status'] = 'completed';
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                Log::info("Download is complete based on progress percentage: 100%");
            }
            
            // Double-check that the file exists and has a reasonable size before marking as completed
            $outputFilePath = isset($progressData['output_file']) ? $progressData['output_file'] : null;
            if ($outputFilePath && file_exists($outputFilePath) && filesize($outputFilePath) > 1024 * 1024) { // At least 1MB
                $progressData['status'] = 'completed';
                $progressData['progress'] = 100;
                $progressData['updated_at'] = date('Y-m-d H:i:s');
                
                Log::info("Download is complete based on log content and file verification. File size: " . filesize($outputFilePath));
            } else {
                Log::info("Download appears to be complete based on log, but waiting for file to be fully written");
            }
        }
    }
    
    public function handle()
    {
        $downloadId = $this->argument('downloadId');
        $progressFile = $this->argument('progressFile');
        $processId = $this->argument('processId');

        Log::info("Starting download monitor for download ID: {$downloadId}, process ID: {$processId}");

        // Check if progress file exists
        if (!file_exists($progressFile)) {
            Log::error("Progress file not found: {$progressFile}");
            return 1;
        }

        // Read initial progress data
        $progressData = json_decode(file_get_contents($progressFile), true);
        if (!$progressData) {
            Log::error("Could not read progress data from {$progressFile}");
            return 1;
        }

        // Ensure the download ID matches
        if (!isset($progressData['id']) || $progressData['id'] !== $downloadId) {
            Log::error("Download ID mismatch in progress file");
            return 1;
        }
        
        // Initialize progress data with better defaults
        if (!isset($progressData['progress']) || $progressData['progress'] === 0) {
            $progressData['progress'] = 0;
            $progressData['downloaded_bytes'] = 0;
            $progressData['total_bytes'] = 0;
            $progressData['eta'] = 'Calculating...';
            $progressData['speed'] = 'Calculating...';
            $progressData['status'] = 'downloading';
            $progressData['updated_at'] = date('Y-m-d H:i:s');
            
            // Save the initialized progress data
            file_put_contents($progressFile, json_encode($progressData));
            Log::info("Initialized progress data for download ID: {$downloadId}");
        }

        try {
            // Monitor the download by checking the output file and the process status
            $isRunning = true;
            $lastModified = filemtime($progressFile);
            $checkInterval = 2; // seconds
            $maxInactivity = 30; // seconds
            $inactivityCounter = 0;
            $startTime = time();
            $initialGracePeriod = 5; // seconds - give the process time to start
            
            // Monitor loop
            while ($isRunning) {
                // Add a delay before checking if the process has stopped
                sleep($checkInterval);
                
                // Check if the process is still running
                $psCommand = "ps -p {$processId} -o pid= > /dev/null 2>&1 && echo 'running' || echo 'stopped'";
                Log::info("Monitor Downloading Running command {$psCommand}");
                $processStatus = trim(shell_exec($psCommand));
                
                Log::debug("Process status: {$processStatus}");
                
                // Read current progress data
                $currentProgressData = json_decode(file_get_contents($progressFile), true);
                
                // Get the output log file path
                $outputLogFile = storage_path("logs/yt-dlp-output-{$downloadId}.log");
                
                // Check if the output log file exists and read the latest progress information
                if (file_exists($outputLogFile)) {
                    // Read the last few lines of the output log file to check for progress
                    $logContent = shell_exec("tail -n 50 {$outputLogFile}");
                    
                    // Parse the progress information from the log content
                    $this->parseProgressFromLog($logContent, $currentProgressData);
                    
                    // Update the progress file with the latest information
                    file_put_contents($progressFile, json_encode($currentProgressData));
                }
                
                Log::debug("Current progress data: " . json_encode($currentProgressData));
                
                if ($processStatus === 'stopped') {
                    // Check if we're still in the initial grace period
                    $elapsedTime = time() - $startTime;
                    
                    if ($elapsedTime < $initialGracePeriod) {
                        // We're still in the grace period, give it more time
                        Log::info("Process appears stopped but still in grace period ({$elapsedTime}s < {$initialGracePeriod}s). Waiting...");
                        sleep(1); // Short sleep to avoid CPU spinning
                        continue;
                    }
                    
                    // Check if the output file exists and has content
                    $outputFilePath = isset($currentProgressData['output_file']) ? $currentProgressData['output_file'] : null;
                    
                    // Check the output log for any indication of completion
                    $outputLogFile = storage_path("logs/yt-dlp-output-{$downloadId}.log");
                    $isCompleted = false;
                    
                    if (file_exists($outputLogFile)) {
                        $logContent = file_get_contents($outputLogFile);
                        // More strict completion detection - require multiple indicators together
                        if ((strpos($logContent, 'Merging formats into') !== false && strpos($logContent, 'Merged into') !== false) || 
                            strpos($logContent, 'has already been downloaded and merged') !== false || 
                            (strpos($logContent, '[download] 100%') !== false && 
                             (strpos($logContent, 'Deleting original file') !== false || 
                              preg_match('/\[ffmpeg\] Merging formats into.*Done/', $logContent)))) {
                            $isCompleted = true;
                        }
                    }
                    
                    // Check if the output file exists and has a reasonable size
                    $fileComplete = false;
                    if ($outputFilePath && file_exists($outputFilePath)) {
                        $fileSize = filesize($outputFilePath);
                        // File should be at least 1MB to be considered complete
                        if ($fileSize > 1024 * 1024) {
                            $fileComplete = true;
                        }
                    }
                    
                    // Only mark as complete if we have strong evidence
                    if ($isCompleted && $fileComplete) {
                        // Both log indicates completion AND file exists with good size
                        $progressData['status'] = 'completed';
                        $progressData['progress'] = 100;
                        $progressData['updated_at'] = date('Y-m-d H:i:s');
                        file_put_contents($progressFile, json_encode($progressData));
                        
                        Log::info("Download completed successfully for ID: {$downloadId}, file exists with size: " . filesize($outputFilePath));
                        return 0;
                    } else if ($fileComplete && isset($currentProgressData['progress']) && $currentProgressData['progress'] >= 95) {
                        // File exists with good size AND progress was very high
                        $progressData['status'] = 'completed';
                        $progressData['progress'] = 100;
                        $progressData['updated_at'] = date('Y-m-d H:i:s');
                        file_put_contents($progressFile, json_encode($progressData));
                        
                        Log::info("Download completed successfully for ID: {$downloadId} based on file size and high progress");
                        return 0;
                    } else {
                        // Check for existing file cases
                        $outputFilePath = isset($currentProgressData['output_file']) ? $currentProgressData['output_file'] : null;
                        
                        // Check if the file already exists (yt-dlp skips downloads for existing files)
                        // This can happen when progress is 0% but the process exits quickly
                        if ($outputFilePath && file_exists($outputFilePath)) {
                            $fileSize = filesize($outputFilePath);
                            
                            // If the file exists and has a reasonable size, consider it a success
                            if ($fileSize > 1024 * 1024) { // Larger than 1MB
                                $progressData['status'] = 'completed';
                                $progressData['progress'] = 100;
                                $progressData['updated_at'] = date('Y-m-d H:i:s');
                                $progressData['filename'] = basename($outputFilePath);
                                file_put_contents($progressFile, json_encode($progressData));
                                
                                Log::info("Download completed for ID: {$downloadId} - file already exists with size: {$fileSize} bytes");
                                return 0;
                            }
                        }
                        
                        // Check if the progress is high - this might be a successful download
                        // even if we couldn't detect completion markers in the log
                        if (isset($currentProgressData['progress']) && $currentProgressData['progress'] > 0) {
                            // Check if we can find the output file
                            if ($outputFilePath && file_exists($outputFilePath) && filesize($outputFilePath) > 1024 * 1024) {
                                $progressData['status'] = 'completed';
                                $progressData['progress'] = 100;
                                $progressData['updated_at'] = date('Y-m-d H:i:s');
                                $progressData['filename'] = basename($outputFilePath);
                                file_put_contents($progressFile, json_encode($progressData));
                                
                                Log::info("Download likely completed for ID: {$downloadId} based on progress ({$currentProgressData['progress']}%) and output file existence");
                                return 0;
                            }
                        }
                        
                        // Check if the process was just starting (very short run time)
                        if ($elapsedTime < $initialGracePeriod + 3) {
                            Log::warning("Process stopped very quickly after starting ({$elapsedTime}s). Possible command error.");
                            // Try to get any error output from yt-dlp
                            $errorLog = storage_path("logs/yt-dlp-error-{$downloadId}.log");
                            if (file_exists($errorLog)) {
                                $errorContent = file_get_contents($errorLog);
                                Log::error("yt-dlp error output: {$errorContent}");
                                $progressData['message'] = "Download failed: {$errorContent}";
                            } else {
                                $progressData['message'] = 'Download process failed to start properly';
                            }
                        } else {
                            $progressData['message'] = 'Download process stopped unexpectedly';
                        }
                        
                        // Process stopped but progress wasn't near completion and no output file
                        $progressData['status'] = 'failed';
                        $progressData['updated_at'] = date('Y-m-d H:i:s');
                        file_put_contents($progressFile, json_encode($progressData));
                        
                        Log::error("Download failed for ID: {$downloadId} - process stopped unexpectedly");
                        return 1;
                    }
                }
                
                // Check for file modifications to detect progress
                $currentModified = filemtime($progressFile);
                if ($currentModified > $lastModified) {
                    // Progress file was updated, reset inactivity counter
                    $lastModified = $currentModified;
                    $inactivityCounter = 0;
                    
                    // Update our local copy of progress data
                    $progressData = $currentProgressData;
                } else {
                    // No updates to progress file, increment inactivity counter
                    $inactivityCounter += $checkInterval;
                    
                    // If no activity for too long, consider it stalled
                    if ($inactivityCounter >= $maxInactivity) {
                        $progressData['status'] = 'failed';
                        $progressData['message'] = 'Download stalled - no progress for ' . $maxInactivity . ' seconds';
                        $progressData['updated_at'] = date('Y-m-d H:i:s');
                        file_put_contents($progressFile, json_encode($progressData));
                        
                        Log::error("Download stalled for ID: {$downloadId} - no progress for {$maxInactivity} seconds");
                        return 1;
                    }
                }
                
                // Check if the download is already marked as completed or failed in the progress file
                if (isset($currentProgressData['status']) && 
                    ($currentProgressData['status'] === 'completed' || $currentProgressData['status'] === 'failed')) {
                    $isRunning = false;
                    return $currentProgressData['status'] === 'completed' ? 0 : 1;
                }
                
                // Wait before checking again
                sleep($checkInterval);
            }
            
            return 0;
        } catch (\Exception $e) {
            // Update progress to failed
            $progressData['status'] = 'failed';
            $progressData['message'] = 'Error monitoring download: ' . $e->getMessage();
            $progressData['updated_at'] = date('Y-m-d H:i:s');
            file_put_contents($progressFile, json_encode($progressData));
            
            Log::error("Error monitoring download: " . $e->getMessage());
            return 1;
        }
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
                            Log::info("Download progress: {$progress}% ({$speed})");
                        }
                    }
                }
            }
        }
    }
}
