<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

use App\Models\User;
use App\Models\Venue;
use App\Models\Department;

class Event extends Model
{
    use HasFactory, Notifiable, HasApiTokens;
    
    protected $table = 'tbl_events';
    protected $primaryKey = 'event_id';
    protected $fillable = [
        'activity_title',
        'activity_description',
        'date',
        'number_of_days',
        'time_start',
        'time_end',
        'requested_by',
        'telephone_number',
        'email',
        'user_id',
        'venue_id',
        'department_id',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function venue(): BelongsTo {
        return $this->belongsTo(Venue::class, 'venue_id', 'venue_id');
    }

    public function department(): BelongsTo {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }
}
