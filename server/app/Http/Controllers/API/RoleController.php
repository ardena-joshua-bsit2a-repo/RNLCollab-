<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function loadRoles() {
        $roles = Role::where('tbl_roles.is_deleted', false)
            ->get();

            return response()->json([
                'roles' => $roles
            ], 200);
    }

    public function storeRole(Request $request){
        $validated = $request->validate([
            'role_name' => ['required', 'min:3', 'max:30'],
            'role_description' => ['nullable', 'string', 'max:255']
        ]);

        $role = Role::create([
            'role_name' => $validated['role_name'],
            'role_description' => $validated['role_description'] ?? null,
        ]);

        ActivityLogger::log(
            $request,
            'created',
            'role',
            sprintf('Created role: %s', $role->role_name),
            $role->role_id,
            $role->role_name,
        );

        return response()->json([
            'message' => 'Role Successfully Saved.'
        ], 200);
    }

    public function getRole($role_id)
    {
        $role = Role::find($role_id);

        return response()->json([
            'role' => $role
        ], 200);
    }

    public function updateRole(Request $request, Role $role) {
        $validated = $request->validate([
            'role_name' => ['required', 'min:3', 'max:30'],
            'role_description' => ['nullable', 'string', 'max:255']
        ]);

        $role->update([
            'role_name' => $validated['role_name'],
            'role_description' => $validated['role_description'] ?? null,
        ]);

        ActivityLogger::log(
            $request,
            'updated',
            'role',
            sprintf('Updated role: %s', $role->role_name),
            $role->role_id,
            $role->role_name,
        );

        return response()->json([
            'message' => 'Role Successfully Updated.',
            'role' => $role
        ], 200);
    }

    public function destroyRole (Request $request, Role $role) {
        $role ->update([
            'is_deleted' => true
        ]);

        ActivityLogger::log(
            $request,
            'deleted',
            'role',
            sprintf('Deleted role: %s', $role->role_name),
            $role->role_id,
            $role->role_name,
        );

        return response()->json([
            'message' => 'Role Successfully Deleted.'
        ], 200);
    }
}
