<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    public function loadUsers() {
        $users = User::with(['role', 'department'])
            ->where('tbl_users.is_deleted', false)
            ->get();

            return response()->json([
                'users' => $users
            ], 200);
    }

    public function storeUser(Request $request) {
        $validated = $request->validate([
            'first_name' => ['required', 'max:55',],
            'middle_name' => ['nullable', 'max:55',],
            'last_name' => ['required', 'max:55',],
            'suffix_name' => ['nullable', 'max:55',],
            'role' => ['required'],
            'department' => ['required'],
            'email' => ['required', 'email', Rule::unique('tbl_users', 'email')],
            'username' => ['required', 'string', 'min:6', 'max:12', Rule::unique('tbl_users', 'username')],
            'password' => ['required', 'string', 'min:6', 'max:12', 'confirmed'],
            'password_confirmation' => ['required', 'min:6', 'max:12']
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name'=> $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'role_id' => $validated['role'],
            'department_id' => $validated['department'],
            'email' => $validated ['email'],
            'username' => $validated ['username'],
            'password' => $validated ['password']
        ]);

        ActivityLogger::log(
            $request,
            'created',
            'user',
            sprintf('Created user account: %s', $validated['username']),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'User Successfully Saved.',
            'user' => $user
        ], 200);
    }

    public function updateUser(Request $request, User $user) {
        $validated = $request->validate([
            'first_name' => ['required', 'max:55',],
            'middle_name' => ['nullable', 'max:55',],
            'last_name' => ['required', 'max:55',],
            'suffix_name' => ['nullable', 'max:55',],
            'role' => ['required'],
            'department' => ['required'],
            'email' => ['required', 'email', Rule::unique('tbl_users', 'email')->ignore($user->user_id, 'user_id')],
            'username' => ['required', 'string', 'min:6', 'max:12', Rule::unique('tbl_users', 'username')->ignore($user->user_id, 'user_id')]
        ]);

        $user->update ([
            'first_name' => $validated['first_name'],
            'middle_name'=> $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'role_id' => $validated['role'],
            'department_id' => $validated['department'],
            'email' => $validated ['email'],
            'username' => $validated ['username'],
        ]);

        ActivityLogger::log(
            $request,
            'updated',
            'user',
            sprintf('Updated user: %s', $validated['username']),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'User Successfully Updated.',
            'user' => $user
        ], 200);
    }

    public function destroyUser(Request $request, User $user) {
        $user->update([
            'is_deleted' => true
        ]);

        ActivityLogger::log(
            $request,
            'deleted',
            'user',
            sprintf('Moved user to trash: %s', $user->username),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'User Successfully Deleted.'
        ], 200);
    }

    public function loadTrashUsers()
    {
        $users = User::with(['role', 'department'])
            ->where('is_deleted', true)
            ->get();

        return response()->json([
            'users' => $users
        ], 200);
    }

        public function restoreUser(Request $request, User $user)
    {
        $user->update([
            'is_deleted' => false
        ]);

        ActivityLogger::log(
            $request,
            'restored',
            'user',
            sprintf('Restored user from trash: %s', $user->username),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'User restored successfully.'
        ], 200);
    }

    public function forceDeleteUser(Request $request, User $user)
    {
        $label = ActivityLogger::userDisplayName($user);
        $userId = $user->user_id;
        $username = $user->username;

        $user->delete();

        ActivityLogger::log(
            $request,
            'force_deleted',
            'user',
            sprintf('Permanently deleted user: %s', $username),
            $userId,
            $label,
        );

        return response()->json([
            'message' => 'User permanently deleted.'
        ], 200);
    }

    public function uploadProfilePhoto(Request $request, User $user)
    {
        $request->validate([
            'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048']
        ]);

        if ($user->profile_photo) {
            $oldPath = str_replace('/storage/', '', $user->profile_photo);
            \Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('profile_photo')->store('profile_photos', 'public');
        $relativePath = '/storage/' . $path;

        $user->update(['profile_photo' => $relativePath]);

        ActivityLogger::log(
            $request,
            'updated',
            'user',
            sprintf('Updated profile photo for user: %s', $user->username),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'Profile photo updated.',
            'profile_photo' => $relativePath
        ], 200);
    }

    public function removeProfilePhoto(Request $request, User $user)
    {
        if ($user->profile_photo) {
            $oldPath = str_replace('/storage/', '', $user->profile_photo);
            \Storage::disk('public')->delete($oldPath);
        }

        $user->update(['profile_photo' => null]);

        return response()->json([
            'message' => 'Profile photo removed.',
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
            'email'       => ['required', 'email', Rule::unique('tbl_users', 'email')->ignore($user->user_id, 'user_id')],
            'username'    => ['required', 'string', 'min:6', 'max:12', Rule::unique('tbl_users', 'username')->ignore($user->user_id, 'user_id')],
            'current_password'      => ['nullable', 'string'],
            'new_password'          => ['nullable', 'string', 'min:6', 'max:12', 'confirmed'],
            'new_password_confirmation' => ['nullable', 'string'],
        ]);

        if (!empty($validated['new_password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $user->password = $validated['new_password'];
        }

        $user->update([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'] ?? null,
            'email'       => $validated['email'],
            'username'    => $validated['username'],
        ]);

        if (!empty($validated['new_password'])) {
            $user->save();
        }

        ActivityLogger::log(
            $request, 'updated', 'user',
            sprintf('Updated own profile: %s', $user->username),
            $user->user_id,
            ActivityLogger::userDisplayName($user),
        );

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(['role', 'department']),
        ], 200);
    }
}
