<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'tbl_notifications';
    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'event_id',
        'is_read',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
