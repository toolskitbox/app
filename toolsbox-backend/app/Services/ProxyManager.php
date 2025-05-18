<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProxyManager
{
    /**
     * Get a list of proxies from various sources
     * 
     * @return string Comma-separated list of proxies
     */
    public function getProxyList()
    {
        // Try to get from cache first
        $cachedProxies = Cache::get('proxy_list');
        if ($cachedProxies) {
            Log::info('Using cached proxy list');
            return $cachedProxies;
        }
        
        // No cached proxies, fetch new ones
        $proxyList = $this->fetchProxies();
        
        if (!empty($proxyList)) {
            // Cache the proxy list for 6 hours
            Cache::put('proxy_list', $proxyList, now()->addHours(6));
            return $proxyList;
        }
        
        // If no proxies found, return empty string
        return '';
    }
    
    /**
     * Fetch proxies from various sources
     * 
     * @return string Comma-separated list of proxies
     */
    private function fetchProxies()
    {
        $proxies = [];
        
        // Try multiple sources to ensure we get working proxies
        $proxies = array_merge($proxies, $this->fetchFromWebshare());
        $proxies = array_merge($proxies, $this->fetchFromProxyScrape());
        $proxies = array_merge($proxies, $this->fetchFromFreeProxyList());
        
        // Filter and validate proxies
        $validProxies = $this->validateProxies($proxies);
        
        if (empty($validProxies)) {
            Log::warning('No valid proxies found');
            return '';
        }
        
        Log::info('Found ' . count($validProxies) . ' valid proxies');
        return implode(',', $validProxies);
    }
    
    /**
     * Fetch proxies from Webshare API
     * 
     * @return array List of proxies
     */
    private function fetchFromWebshare()
    {
        $apiKey = env('WEBSHARE_API_KEY');
        if (empty($apiKey)) {
            return [];
        }
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $apiKey
            ])->get('https://proxy.webshare.io/api/v2/proxy/list/');
            
            if ($response->successful()) {
                $results = $response->json()['results'] ?? [];
                $proxies = [];
                
                foreach ($results as $proxy) {
                    $proxies[] = $proxy['username'] . ':' . $proxy['password'] . '@' . 
                               $proxy['proxy_address'] . ':' . $proxy['ports']['http'];
                }
                
                Log::info('Fetched ' . count($proxies) . ' proxies from Webshare');
                return $proxies;
            }
        } catch (\Exception $e) {
            Log::error('Error fetching proxies from Webshare: ' . $e->getMessage());
        }
        
        return [];
    }
    
    /**
     * Fetch proxies from ProxyScrape API
     * 
     * @return array List of proxies
     */
    private function fetchFromProxyScrape()
    {
        $apiKey = env('PROXYSCRAPE_API_KEY');
        if (empty($apiKey)) {
            return [];
        }
        
        try {
            $response = Http::get("https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all&format=json&authorization={$apiKey}");
            
            if ($response->successful()) {
                $results = $response->json()['data'] ?? [];
                $proxies = [];
                
                foreach ($results as $proxy) {
                    $proxies[] = $proxy['ip'] . ':' . $proxy['port'];
                }
                
                Log::info('Fetched ' . count($proxies) . ' proxies from ProxyScrape');
                return $proxies;
            }
        } catch (\Exception $e) {
            Log::error('Error fetching proxies from ProxyScrape: ' . $e->getMessage());
        }
        
        return [];
    }
    
    /**
     * Fetch free proxies from public lists
     * 
     * @return array List of proxies
     */
    private function fetchFromFreeProxyList()
    {
        try {
            // Free proxy list (as a fallback)
            $response = Http::get('https://www.proxy-list.download/api/v1/get?type=http');
            
            if ($response->successful()) {
                $proxies = explode("\r\n", $response->body());
                $proxies = array_filter($proxies); // Remove empty entries
                
                Log::info('Fetched ' . count($proxies) . ' proxies from free proxy list');
                return $proxies;
            }
        } catch (\Exception $e) {
            Log::error('Error fetching proxies from free proxy list: ' . $e->getMessage());
        }
        
        return [];
    }
    
    /**
     * Validate proxies by testing them
     * 
     * @param array $proxies List of proxies to validate
     * @return array List of valid proxies
     */
    private function validateProxies($proxies)
    {
        $validProxies = [];
        $testUrl = 'https://www.google.com';
        $timeout = 5;
        
        // Limit to testing 20 proxies to avoid long delays
        $proxiesToTest = array_slice($proxies, 0, 20);
        
        foreach ($proxiesToTest as $proxy) {
            try {
                $response = Http::timeout($timeout)
                    ->withOptions([
                        'proxy' => 'http://' . $proxy,
                        'verify' => false
                    ])
                    ->get($testUrl);
                
                if ($response->successful()) {
                    $validProxies[] = $proxy;
                    
                    // If we have at least 5 valid proxies, that's enough
                    if (count($validProxies) >= 5) {
                        break;
                    }
                }
            } catch (\Exception $e) {
                // Proxy failed, skip it
                continue;
            }
        }
        
        return $validProxies;
    }
    
    /**
     * Get a single random proxy from the list
     * 
     * @return string|null A single proxy or null if none available
     */
    public function getRandomProxy()
    {
        $proxyList = $this->getProxyList();
        if (empty($proxyList)) {
            return null;
        }
        
        $proxies = explode(',', $proxyList);
        return $proxies[array_rand($proxies)];
    }
}
