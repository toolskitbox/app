<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanOldDownloads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'downloads:clean {--hours=1 : Number of hours after which files should be deleted}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete downloaded files that are older than the specified number of hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = $this->option('hours');
        $this->info("Cleaning downloaded files older than {$hours} hour(s)...");
        
        // Path to the downloads directory
        $downloadsDir = storage_path('app/public/downloads');
        
        // Check if directory exists
        if (!file_exists($downloadsDir)) {
            $this->info("Downloads directory does not exist. Nothing to clean.");
            return 0;
        }
        
        // Initialize counters
        $deletedCount = 0;
        $totalSize = 0;
        $processedCount = 0;
        $startTime = microtime(true);
        
        // Use DirectoryIterator for better memory efficiency with large directories
        try {
            $iterator = new \DirectoryIterator($downloadsDir);
            
            foreach ($iterator as $fileInfo) {
                // Skip dots (. and ..) and directories and progress files
                if ($fileInfo->isDot() || $fileInfo->isDir()) {
                    continue;
                }
                
                $processedCount++;
                
                // Full path to the file
                $file = $fileInfo->getPathname();
                
                // Get file modification time
                $modTime = $fileInfo->getMTime();
                $fileAge = Carbon::createFromTimestamp($modTime);
                $now = Carbon::now();
                
                // Check if file is older than specified hours
                if ($fileAge->diffInHours($now) >= $hours) {
                    $fileSize = $fileInfo->getSize();
                    $totalSize += $fileSize;
                    
                    // Log file details before deletion
                    $this->info("Deleting: " . $fileInfo->getFilename() . " (Age: " . $fileAge->diffForHumans() . ", Size: " . $this->formatBytes($fileSize) . ")");
                    
                    // Delete the file
                    if (unlink($file)) {
                        $deletedCount++;
                    } else {
                        $this->error("Failed to delete: " . $fileInfo->getFilename());
                        Log::error("Failed to delete file: {$file}");
                    }
                }
                
                // Free up memory
                unset($fileInfo);
            }
        } catch (\Exception $e) {
            $this->error("Error processing directory: " . $e->getMessage());
            Log::error("Error in CleanOldDownloads: " . $e->getMessage());
            return 1;
        }
        
        $executionTime = round(microtime(true) - $startTime, 2);
        
        // Log summary
        if ($deletedCount > 0) {
            $this->info("Successfully deleted {$deletedCount} file(s), freed " . $this->formatBytes($totalSize) . " of disk space.");
            $this->info("Processed {$processedCount} files in {$executionTime} seconds.");
            Log::info("Cleaned {$deletedCount} old download files, freed " . $this->formatBytes($totalSize) . " of disk space.");
        } else {
            $this->info("No files found older than {$hours} hour(s). Processed {$processedCount} files in {$executionTime} seconds.");
        }
        
        return 0;
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
}
