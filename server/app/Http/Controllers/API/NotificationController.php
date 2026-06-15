<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->user_id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $notifications->where('is_read', false)->count(),
        ], 200);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('notification_id', $id)
            ->where('user_id', $request->user()->user_id)
            ->firstOrFail();

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read.'], 200);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->user_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All marked as read.'], 200);
    }
}
