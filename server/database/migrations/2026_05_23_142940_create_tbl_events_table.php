<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_events', function (Blueprint $table) {
            $table->id('event_id');
            $table->string('activity_title', 100);
            $table->text('activity_description')->nullable();
            $table->date('date');
            $table->integer('number_of_days');
            $table->time('time_start');
            $table->time('time_end');
            $table->string('requested_by', 100);
            $table->string('telephone_number', 20)->nullable();
            $table->string('email');

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('venue_id');
            $table->unsignedBigInteger('department_id')->nullable(); 
            $table->tinyInteger('is_deleted')->default(false);

            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('venue_id')
                ->references('venue_id')
                ->on('tbl_venues')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('department_id')
                ->references('department_id')
                ->on('tbl_departments')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_events');
        Schema::enableForeignKeyConstraints();
    }
};
