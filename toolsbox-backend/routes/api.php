<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Tools\MediaController;
use App\Http\Controllers\Tools\WebToolsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google OAuth routes
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Public media download route
Route::get('/tools/media/download/{filename}', [MediaController::class, 'serveDownload']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Media Tools (Backend tools)
    Route::prefix('tools/media')->group(function () {
        Route::post('/video-info', [MediaController::class, 'getVideoInfo']);
        Route::post('/video-downloader', [MediaController::class, 'downloadVideo']);
        Route::post('/audio-converter', [MediaController::class, 'convertAudio']);
        Route::post('/image-tools', [MediaController::class, 'processImage']);
        Route::post('/video-converter', [MediaController::class, 'convertVideo']);
        Route::post('/file-converter', [MediaController::class, 'convertFile']);
        Route::get('/download-progress/{downloadId}', [MediaController::class, 'checkDownloadProgress']);
        Route::post('/video-downloader/cancel', [MediaController::class, 'cancelDownload']);
    });
    
    // Web Tools (Backend tools)
    Route::prefix('tools/web')->group(function () {
        Route::post('/url-shortener', [WebToolsController::class, 'shortenUrl']);
        Route::get('/url-shortener/{code}', [WebToolsController::class, 'redirectUrl']);
        Route::post('/ip-lookup', [WebToolsController::class, 'lookupIp']);
    });
});
