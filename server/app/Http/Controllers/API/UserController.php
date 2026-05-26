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
            'status' => ['required', 'in:active,inactive'],
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
            'status' => $validated ['status'],
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
            'message' => 'User Successfully Saved.'
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
            'status' => ['required', 'in:active,inactive'],
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
            'status' => $validated ['status'],
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
}
