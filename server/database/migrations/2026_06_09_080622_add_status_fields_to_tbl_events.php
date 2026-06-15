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
        Schema::table('tbl_events', function (Blueprint $table) {
        $table->dropForeign(['department_id']);
        $table->unsignedBigInteger('department_id')->nullable()->change();
        $table->foreign('department_id')
            ->references('department_id')
            ->on('tbl_departments')
            ->onUpdate('cascade')
            ->onDelete('set null');

        if (!Schema::hasColumn('tbl_events', 'status')) {
            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->after('email');
        }
        if (!Schema::hasColumn('tbl_events', 'reviewed_by')) {
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('status');
            $table->foreign('reviewed_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onDelete('set null');
        }
        if (!Schema::hasColumn('tbl_events', 'reviewed_at')) {
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        }
        if (!Schema::hasColumn('tbl_events', 'rejection_reason')) {
            $table->text('rejection_reason')->nullable()->after('reviewed_at');
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_events', function (Blueprint $table) {
        $table->dropForeign(['reviewed_by']);
        $table->dropForeign(['department_id']);
        $table->dropColumn(['status', 'reviewed_by', 'reviewed_at', 'rejection_reason']);
        // Restore department_id as non-nullable
        $table->unsignedBigInteger('department_id')->nullable(false)->change();
        $table->foreign('department_id')
            ->references('department_id')
            ->on('tbl_departments')
            ->onUpdate('cascade')
            ->onDelete('cascade');
        });
    }
};
