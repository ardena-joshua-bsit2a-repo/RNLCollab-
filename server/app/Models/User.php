<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'tbl_users';
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'profile_photo',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'email',
        'username',
        'password',
        'role_id',
        'department_id',
        'is_deleted',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function getAuthIdentifierName(): string
    {
        return 'user_id';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role?->role_name === 'Super Admin';
    }

    public function role(): BelongsTo {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function department(): BelongsTo {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }
}
