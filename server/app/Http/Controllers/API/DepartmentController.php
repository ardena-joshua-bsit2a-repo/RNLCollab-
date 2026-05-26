<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function loadDepartments() {
        $departments = Department::where('tbl_departments.is_deleted', false)
            ->get();

            return response()->json([
                'departments' => $departments
            ], 200);
    }

    public function storeDepartment(Request $request){
        $validated = $request->validate([
            'department_name' => ['required', 'min:3', 'max:30'],
            'department_description' => ['nullable', 'string', 'max:255']
        ]);

        $department = Department::create([
            'department_name' => $validated['department_name'],
            'department_description' => $validated['department_description'] ?? null,
        ]);

        ActivityLogger::log(
            $request,
            'created',
            'department',
            sprintf('Created department: %s', $department->department_name),
            $department->department_id,
            $department->department_name,
        );

        return response()->json([
            'message' => 'Department Successfully Saved.'
        ], 200);
    }

    public function getDepartment($department_id)
    {
        $department = Department::find($department_id);

        return response()->json([
            'department' => $department
        ], 200);
    }

    public function updateDepartment(Request $request, Department $department) {
        $validated = $request->validate([
            'department_name' => ['required', 'min:3', 'max:30'],
            'department_description' => ['nullable', 'string', 'max:255']
        ]);

        $department->update([
            'department_name' => $validated['department_name'],
            'department_description' => $validated['department_description'] ?? null,
        ]);

        ActivityLogger::log(
            $request,
            'updated',
            'department',
            sprintf('Updated department: %s', $department->department_name),
            $department->department_id,
            $department->department_name,
        );

        return response()->json([
            'message' => 'Department Successfully Updated.',
            'department' => $department
        ], 200);
    }

    public function destroyDepartment (Request $request, Department $department) {
        $department ->update([
            'is_deleted' => true
        ]);

        ActivityLogger::log(
            $request,
            'deleted',
            'department',
            sprintf('Deleted department: %s', $department->department_name),
            $department->department_id,
            $department->department_name,
        );

        return response()->json([
            'message' => 'Department Successfully Deleted.'
        ], 200);
    }
}
