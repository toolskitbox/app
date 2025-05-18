<?php

namespace App\Http\Controllers\Tools;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\ShortUrl;

class WebToolsController extends Controller
{
    /**
     * Shorten a URL
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function shortenUrl(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'custom_code' => 'nullable|string|min:3|max:20|alpha_num|unique:short_urls,code',
            'expires_at' => 'nullable|date|after:now'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate a unique code if not provided
            $code = $request->custom_code ?? Str::random(6);
            
            // Create the short URL record
            $shortUrl = ShortUrl::create([
                'original_url' => $request->url,
                'code' => $code,
                'user_id' => auth()->id(),
                'expires_at' => $request->expires_at
            ]);
            
            // Generate the short URL
            $shortUrlDomain = env('SHORT_URL_DOMAIN', config('app.url'));
            $shortUrl = rtrim($shortUrlDomain, '/') . '/' . $code;
            
            return response()->json([
                'message' => 'URL shortened successfully',
                'original_url' => $request->url,
                'short_url' => $shortUrl,
                'code' => $code,
                'expires_at' => $request->expires_at
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error shortening URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Redirect to the original URL from a short URL code
     *
     * @param string $code
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectUrl($code)
    {
        $shortUrl = ShortUrl::where('code', $code)->first();
        
        if (!$shortUrl) {
            return response()->json([
                'message' => 'Short URL not found'
            ], 404);
        }
        
        // Check if the URL has expired
        if ($shortUrl->expires_at && $shortUrl->expires_at < now()) {
            return response()->json([
                'message' => 'Short URL has expired'
            ], 410);
        }
        
        // Increment the click count
        $shortUrl->increment('clicks');
        
        // Redirect to the original URL
        return redirect()->away($shortUrl->original_url);
    }
    
    /**
     * Lookup IP address information
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function lookupIp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip' => 'required|ip'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Use ip-api.com with all available fields
            $fields = 'status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query';
            $response = Http::get('http://ip-api.com/json/' . $request->ip . '?fields=' . $fields);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['status']) && $data['status'] === 'success') {
                    return response()->json([
                        'message' => 'IP lookup successful',
                        'ip' => $request->ip,
                        'data' => $data
                    ]);
                } else {
                    return response()->json([
                        'message' => 'Error looking up IP',
                        'error' => $data['message'] ?? 'Unknown error'
                    ], 400);
                }
            } else {
                return response()->json([
                    'message' => 'Error looking up IP',
                    'error' => 'API request failed with status code ' . $response->status()
                ], 500);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error looking up IP',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
