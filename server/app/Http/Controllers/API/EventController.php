<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Http;
use App\Models\Notification;
use App\Models\User;

class EventController extends Controller
{
    public function loadEvent()
    {
        $events = Event::with(['user', 'venue', 'department'])
            ->where('is_deleted', false)
            ->whereIn('status', ['approved', 'rejected'])
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function loadAllEvents()
    {
        $events = Event::with(['user', 'venue', 'department'])
            ->where('is_deleted', false)
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function loadPendingEvents()
    {
        $events = Event::with(['user', 'venue', 'department'])
            ->where('is_deleted', false)
            ->where('status', 'pending')
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function loadUserEvents(Request $request)
    {
        $events = Event::with(['user', 'venue', 'department'])
            ->where('is_deleted', false)
            ->where('user_id', $request->user()->user_id)
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'activity_title'      => ['required', 'max:55'],
            'activity_description'=> ['nullable', 'max:55'],
            'date'                => ['required', 'date'],
            'number_of_days'      => ['required', 'integer', 'min:1'],
            'time_end'            => ['required', 'date_format:H:i'],
            'time_start'          => ['required', 'date_format:H:i'],
            'requested_by'        => ['required', 'min:6', 'max:55'],
            'telephone_number'    => ['nullable', 'max:55'],
            'email'               => ['required', 'email'],
            'user_id'             => ['required'],
            'venue_id'            => ['required'],
            'department_id'       => ['nullable'],
        ]);

        $event = Event::create([
            'activity_title'       => $validated['activity_title'],
            'activity_description' => $validated['activity_description'] ?? null,
            'date'                 => $validated['date'],
            'number_of_days'       => $validated['number_of_days'],
            'time_start'           => $validated['time_start'],
            'time_end'             => $validated['time_end'],
            'requested_by'         => $validated['requested_by'],
            'telephone_number'     => $validated['telephone_number'] ?? null,
            'email'                => $validated['email'],
            'status'               => 'pending',
            'user_id'              => $request->user()->user_id,
            'venue_id'             => $validated['venue_id'],
            'department_id'        => $request->user()->department_id,
        ]);

        $this->fireWebhook('new_booking', $event, $request);

        // Notify all Super Admins
        $admins = User::whereHas('role', fn($q) => $q->where('role_name', 'Super Admin'))
            ->where('is_deleted', false)
            ->get();

        foreach ($admins as $admin) {
            $this->createNotification(
                $admin->user_id,
                'new_booking',
                'New Booking Request',
                sprintf('%s submitted a booking for %s on %s.', $event->requested_by, $event->venue?->venue_name, $event->date),
                $event->event_id,
            );
        }

        ActivityLogger::log(
            $request, 'created', 'event',
            sprintf('Created event: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json(['message' => 'Event Successfully Saved.'], 200);
    }

    public function updateEvent(Request $request, Event $event)
    {
        $validated = $request->validate([
            'activity_title'      => ['required', 'max:55'],
            'activity_description'=> ['nullable', 'max:255'],
            'date'                => ['required', 'date'],
            'number_of_days'      => ['required', 'integer', 'min:1'],
            'time_start'          => ['required'],
            'time_end'            => ['required'],
            'requested_by'        => ['required', 'min:6', 'max:55'],
            'telephone_number'    => ['nullable', 'max:20'],
            'email'               => ['required', 'email'],
            'user_id'             => ['required'],
            'venue_id'            => ['required'],
            'department_id'       => ['nullable'],
        ]);

        $event->update([
            'activity_title'       => $validated['activity_title'],
            'activity_description' => $validated['activity_description'] ?? null,
            'date'                 => $validated['date'],
            'number_of_days'       => $validated['number_of_days'],
            'time_start'           => $validated['time_start'],
            'time_end'             => $validated['time_end'],
            'requested_by'         => $validated['requested_by'],
            'telephone_number'     => $validated['telephone_number'] ?? null,
            'email'                => $validated['email'],
            'user_id'              => $validated['user_id'],
            'venue_id'             => $validated['venue_id'],
            'department_id'        => $validated['department_id'] ?? null,
        ]);

        ActivityLogger::log(
            $request, 'updated', 'event',
            sprintf('Updated event: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json([
            'message' => 'Event Successfully Updated.',
            'event'   => $event
        ], 200);
    }

    public function destroyEvent(Request $request, Event $event)
    {
        $event->update(['is_deleted' => true]);

        $action = $request->user()->role?->role_name === 'Super Admin'
            ? 'deleted'
            : 'cancelled';

        ActivityLogger::log(
            $request, $action, 'event',
            sprintf('%s: %s',
                $action === 'cancelled' ? 'Cancelled booking request' : 'Moved event to trash',
                $event->activity_title
            ),
            $event->event_id, $event->activity_title,
        );

        return response()->json([
            'message' => $action === 'cancelled'
                ? 'Booking request cancelled.'
                : 'Event Successfully Deleted.'
        ], 200);
    }

    public function loadTrashEvent()
    {
        $events = Event::with(['user', 'venue', 'department'])
            ->where('is_deleted', true)
            ->get();

        return response()->json(['events' => $events]);  // ✅ fixed — removed $action reference
    }

    public function restoreEvent(Request $request, Event $event)
    {
        $event->update(['is_deleted' => false]);

        ActivityLogger::log(
            $request, 'restored', 'event',
            sprintf('Restored event from trash: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json(['message' => 'Event restored successfully.']);
    }

    public function forceDeleteEvent(Request $request, $event_id)
    {
        $event = Event::where('event_id', $event_id)->first();

        if (!$event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $title   = $event->activity_title;
        $eventId = $event->event_id;
        $event->delete();

        ActivityLogger::log(
            $request, 'force_deleted', 'event',
            sprintf('Permanently deleted event: %s', $title),
            $eventId, $title,
        );

        return response()->json(['message' => 'Event permanently deleted.'], 200);
    }

    public function approveEvent(Request $request, Event $event)  // ✅ only ONE approveEvent
    {
        if ($event->status === 'approved') {
            return response()->json(['message' => 'Event is already approved.'], 422);
        }

        $event->update([
            'status'           => 'approved',
            'reviewed_by'      => $request->user()->user_id,
            'reviewed_at'      => now(),
            'rejection_reason' => null,
        ]);

        $event->refresh();

        $this->fireWebhook('approved', $event, $request);

        $this->createNotification(
            $event->user_id,
            'approved',
            'Booking Approved',
            sprintf('Your booking "%s" on %s has been approved.', $event->activity_title, $event->date),
            $event->event_id,
        );

        ActivityLogger::log(
            $request, 'approved', 'event',
            sprintf('Approved event: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json([
            'message' => 'Event approved successfully.',
            'event'   => $event
        ], 200);
    }

    public function rejectEvent(Request $request, Event $event)
    {
        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:255'],
        ]);

        if ($event->status !== 'pending') {
            return response()->json(['message' => 'Only pending events can be rejected.'], 422);
        }

        $event->update([
            'status'           => 'rejected',
            'reviewed_by'      => $request->user()->user_id,
            'reviewed_at'      => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        $event->refresh();

        $this->fireWebhook('rejected', $event, $request, $validated['rejection_reason'] ?? null);

        $this->createNotification(
            $event->user_id,
            'rejected',
            'Booking Rejected',
            sprintf('Your booking "%s" was rejected. Reason: %s', $event->activity_title, $validated['rejection_reason'] ?? 'No reason provided.'),
            $event->event_id,
        );

        ActivityLogger::log(
            $request, 'rejected', 'event',
            sprintf('Rejected event: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json([
            'message' => 'Event rejected.',
            'event'   => $event
        ], 200);
    }

    public function revertEvent(Request $request, Event $event)
    {
        if ($event->status === 'pending') {  // ✅ check BEFORE update
            return response()->json(['message' => 'Event is already pending.'], 422);
        }

        $event->update([
            'status'           => 'pending',
            'reviewed_by'      => null,
            'reviewed_at'      => null,
            'rejection_reason' => null,
        ]);

        ActivityLogger::log(
            $request, 'reverted', 'event',
            sprintf('Reverted event to pending: %s', $event->activity_title),
            $event->event_id, $event->activity_title,
        );

        return response()->json([
            'message' => 'Event reverted to pending.',
            'event'   => $event
        ], 200);
    }

    private function fireWebhook(string $type, Event $event, Request $request, ?string $rejectionReason = null): void
    {
        $urls = [
            'new_booking' => env('N8N_WEBHOOK_NEW_BOOKING'),
            'approved'    => env('N8N_WEBHOOK_APPROVED'),
            'rejected'    => env('N8N_WEBHOOK_APPROVED'),
        ];

        $webhookUrl = $urls[$type] ?? null;
        if (!$webhookUrl) return;

        // Load relationships if not already loaded
        $event->loadMissing(['venue', 'department', 'user']);

        try {
            Http::timeout(5)->post($webhookUrl, [
                'event_id'         => $event->event_id,
                'venue_id'         => $event->venue_id,
                'activity_title'   => $event->activity_title,
                'description'      => $event->activity_description ?? '',
                'date'             => $event->date,
                'time_start'       => $event->time_start,
                'time_end'         => $event->time_end,
                'number_of_days'   => $event->number_of_days,
                'venue_name'       => $event->venue?->venue_name ?? '',
                'department_name'  => $event->department?->department_name ?? '',
                'requested_by'     => $event->requested_by,
                'email'            => $event->email,
                'rejection_reason' => $rejectionReason,
                'status' => $event->status,
                'admin_email'      => env('ADMIN_EMAIL'),
                'conflict_check_url' => env('APP_URL') . '/api/event/checkConflict',
                'app_url'          => env('APP_URL'),
            ]);
        } catch (\Exception $e) {
            \Log::warning("n8n webhook [{$type}] failed: " . $e->getMessage());
        }
    }

    public function checkConflict(Request $request)
    {
        $validated = $request->validate([
            'venue_id'      => ['required'],
            'department_id' => ['nullable'],
            'date'          => ['required', 'date'],
            'time_start'    => ['required'],
            'time_end'      => ['required'],
            'event_id'      => ['nullable'],
        ]);

        $query = Event::with(['venue', 'department'])
            ->where('is_deleted', false)
            ->whereIn('status', ['pending', 'approved'])
            ->where('venue_id', $validated['venue_id'])
            ->where('date', $validated['date']);

        if (!empty($validated['event_id'])) {
            $query->where('event_id', '!=', $validated['event_id']);
        }

        $existingEvents = $query->get();
        $conflicts = [];

        foreach ($existingEvents as $existing) {
            $newStart  = strtotime($validated['time_start']);
            $newEnd    = strtotime($validated['time_end']);
            $exStart   = strtotime($existing->time_start);
            $exEnd     = strtotime($existing->time_end);

            $timeOverlap = $newStart < $exEnd && $newEnd > $exStart;
            $deptConflict = !empty($validated['department_id'])
                && $existing->department_id == $validated['department_id'];

            if ($timeOverlap || $deptConflict) {
                $conflicts[] = [
                    'event_id'        => $existing->event_id,
                    'activity_title'  => $existing->activity_title,
                    'date'            => $existing->date,
                    'time_start'      => $existing->time_start,
                    'time_end'        => $existing->time_end,
                    'venue_name'      => $existing->venue?->venue_name,
                    'department_name' => $existing->department?->department_name,
                    'status'          => $existing->status,
                    'conflict_type'   => $timeOverlap && $deptConflict
                        ? 'venue + department + time overlap'
                        : ($timeOverlap ? 'venue + time overlap' : 'department overlap'),
                ];
            }
        }

        return response()->json([
            'has_conflict' => count($conflicts) > 0,
            'conflicts'    => $conflicts,
        ], 200);
    }

    private function createNotification(int $userId, string $type, string $title, string $message, ?int $eventId = null): void
    {
        Notification::create([
            'user_id'  => $userId,
            'type'     => $type,
            'title'    => $title,
            'message'  => $message,
            'event_id' => $eventId,
        ]);
    }
}
