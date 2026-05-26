<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::with(['role', 'department'])
            ->where('username', $validated['username'])
            ->where('is_deleted', false)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid username or password.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is inactive. Contact an administrator.',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user->createToken('api')->plainTextToken;

        ActivityLogger::log(
            $request,
            'login',
            'auth',
            sprintf('Logged in (%s)', $user->role?->role_name ?? 'User'),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
            $user->user_id,
        );

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user()->load('role');

        ActivityLogger::log(
            $request,
            'logout',
            'auth',
            sprintf('Logged out (%s)', $user->role?->role_name ?? 'User'),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }

    public function me(Request $request)
    {
        $user = User::with(['role', 'department'])
            ->where('user_id', $request->user()->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'user' => $user,
        ], 200);
    }
}
