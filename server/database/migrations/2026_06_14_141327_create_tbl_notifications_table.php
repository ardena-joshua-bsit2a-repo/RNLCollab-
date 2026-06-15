<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('user_id');
            $table->string('type', 50); // 'new_booking', 'approved', 'rejected'
            $table->string('title', 100);
            $table->text('message');
            $table->unsignedBigInteger('event_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('tbl_users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_notifications');
    }
};
