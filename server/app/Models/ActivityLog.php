<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $table = 'tbl_activity_logs';
    protected $primaryKey = 'activity_log_id';

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'subject_id',
        'subject_label',
        'ip_address',
        'user_agent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
