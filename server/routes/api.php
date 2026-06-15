<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\VenueController;
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\ActivityLogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\NotificationController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/event/checkConflict', [EventController::class, 'checkConflict']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/users/uploadProfilePhoto/{user}', [UserController::class, 'uploadProfilePhoto']);

    Route::controller(VenueController::class)->prefix('/venue')->group(function () {
        Route::get('/loadVenue', 'loadVenue');
        Route::get('/getVenue/{venueId}', 'getVenue');
        Route::post('/storeVenue', 'storeVenue');
        Route::put('/updateVenue/{venue}', 'updateVenue');
        Route::put('/destroyVenue/{venue}', 'destroyVenue');
    });

    Route::controller(EventController::class)->prefix('/event')->group(function () {
        Route::get('/loadEvent', 'loadEvent');
        Route::get('/loadUserEvents', 'loadUserEvents');
        Route::get('/loadAllEvents', 'loadAllEvents');
        Route::post('/storeEvent', 'storeEvent');
        Route::put('/updateEvent/{event}', 'updateEvent');
        Route::put('/destroyEvent/{event}', 'destroyEvent');
        Route::get('/loadTrashEvent', 'loadTrashEvent');
        Route::put('/restoreEvent/{event}', 'restoreEvent');
        Route::delete('/forceDeleteEvent/{event}', 'forceDeleteEvent');
    });

    Route::controller(UserController::class)->prefix('/users')->group(function () {
        Route::post('/uploadProfilePhoto/{user}', 'uploadProfilePhoto');
    });

    Route::middleware('super_admin')->group(function () {
        Route::controller(RoleController::class)->prefix('/role')->group(function () {
            Route::get('/loadRole', 'loadRoles');
            Route::get('/getRole/{role_id}', 'getRole');
            Route::post('/storeRole', 'storeRole');
            Route::put('/updateRole/{role}', 'updateRole');
            Route::put('/destroyRole/{role}', 'destroyRole');
        });

        Route::put('/event/approveEvent/{event}', [EventController::class, 'approveEvent']);
        Route::put('/event/rejectEvent/{event}',  [EventController::class, 'rejectEvent']);
        Route::get('/event/loadPendingEvents', [EventController::class, 'loadPendingEvents']);
        Route::put('/event/revertEvent/{event}',  [EventController::class, 'revertEvent']);

        Route::controller(DepartmentController::class)->prefix('/department')->group(function () {
            Route::get('/loadDepartment', 'loadDepartments');
            Route::get('/getDepartment/{department_id}', 'getDepartment');
            Route::post('/storeDepartment', 'storeDepartment');
            Route::put('/updateDepartment/{department}', 'updateDepartment');
            Route::put('/destroyDepartment/{department}', 'destroyDepartment');
        });

        Route::controller(UserController::class)->prefix('/users')->group(function () {
            Route::get('/loadUsers', 'loadUsers');
            Route::post('/storeUser', 'storeUser');
            Route::put('/updateUser/{user}', 'updateUser');
            Route::put('/destroyUser/{user}', 'destroyUser');
            Route::get('/loadTrashUsers', 'loadTrashUsers');
            Route::put('/restoreUser/{user}', 'restoreUser');
            Route::delete('/forceDeleteUser/{user}', 'forceDeleteUser');
            Route::delete('/removeProfilePhoto/{user}', 'removeProfilePhoto');
        });

        Route::controller(ActivityLogController::class)->prefix('/activity-logs')->group(function () {
            Route::get('/loadActivityLogs', 'loadActivityLogs');
        });
    });


});
