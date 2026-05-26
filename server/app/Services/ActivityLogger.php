<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public static function log(
        ?Request $request,
        string $action,
        string $module,
        string $description,
        ?int $subjectId = null,
        ?string $subjectLabel = null,
        ?int $userId = null,
    ): void {
        ActivityLog::create([
            'user_id' => $userId ?? $request?->user()?->user_id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'subject_id' => $subjectId,
            'subject_label' => $subjectLabel,
            'ip_address' => $request?->ip(),
            'user_agent' => $request ? substr((string) $request->userAgent(), 0, 500) : null,
        ]);
    }

    public static function userDisplayName(User $user): string
    {
        $parts = array_filter([
            $user->first_name,
            $user->middle_name,
            $user->last_name,
            $user->suffix_name,
        ]);

        return implode(' ', $parts);
    }
}
