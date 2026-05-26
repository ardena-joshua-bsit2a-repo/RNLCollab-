<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::create([
            'role_name' => 'Super Admin',
            'role_description' => 'Full system access',
            'status' => 'Active',
        ]);

        $staffRole = Role::create([
            'role_name' => 'Staff',
            'role_description' => 'Event and venue management',
            'status' => 'Active',
        ]);

        $department = Department::create([
            'department_name' => 'Administration',
            'department_description' => 'Central administration office',
            'status' => 'Active',
        ]);

        User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@gmail.com',
            'username' => 'superadmin',
            'password' => 'admin123',
            'status' => 'active',
            'role_id' => $superAdminRole->role_id,
            'department_id' => $department->department_id,
        ]);

        User::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'staff@filsched.com',
            'username' => 'staffuser',
            'password' => 'staff123',
            'status' => 'active',
            'role_id' => $staffRole->role_id,
            'department_id' => $department->department_id,
        ]);
    }
}
