<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function loadActivityLogs(Request $request)
    {
        $validated = $request->validate([
            'module' => ['nullable', 'string', 'max:30'],
            'action' => ['nullable', 'string', 'max:30'],
            'user_id' => ['nullable', 'integer'],
        ]);

        $query = ActivityLog::with(['user.role'])
            ->orderByDesc('created_at');

        if (!empty($validated['module'])) {
            $query->where('module', $validated['module']);
        }

        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        $logs = $query->limit(500)->get();

        return response()->json([
            'logs' => $logs,
        ], 200);
    }
}
