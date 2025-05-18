<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Routing\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect()
    {
        // Use stateless to avoid session dependency completely
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback(Request $request)
    {
        try {
            // Use stateless method to avoid session dependency completely
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user exists
            $user = User::where('email', $googleUser->email)->first();
            
            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(16)), // Random password
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
            } else {
                // Update existing user with Google info
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
            }
            
            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Redirect to frontend login page with token
            return redirect(config('app.frontend_url') . '/login?token=' . $token);
            
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Google OAuth error: ' . $e->getMessage());
            return redirect(config('app.frontend_url') . '/login?error=oauth_error');
        }
    }
}
