<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    public function loadVenue() {
        $venues = Venue::where('tbl_venues.is_deleted', false)
            ->get();
        
        return response()->json([
            'venues' => $venues
        ], 200);
    }

    public function storeVenue(Request $request)
    {
        $validated = $request->validate([
            'venue' => ['required', 'min:3', 'max:30'],
            'venue_description' => ['nullable']
        ]);

        $venue = Venue::create([
            'venue_name' => $validated['venue'],
            'venue_description' => $validated['venue_description'] ?? null,
        ]);

        ActivityLogger::log(
            $request,
            'created',
            'venue',
            sprintf('Created venue: %s', $venue->venue_name),
            $venue->venue_id,
            $venue->venue_name,
        );

        return response()->json([
            'message' => 'Venue Successfully Saved.'
        ], 200);
    }

    public function getVenue($venueId) {
        $venue = Venue::find($venueId);

        return response()->json([
            'venue' => $venue
        ], 200);
    }

    public function updateVenue(Request $request, Venue $venue) {
        $validated = $request->validate([
            'venue_name' => ['required', 'min:3', 'max:30'],
            'venue_description' => ['nullable']
        ]);

        $venue->update([
            'venue_name' => $validated['venue_name'],
            'venue_description' => $validated['venue_description'] ?? null
        ]);

        ActivityLogger::log(
            $request,
            'updated',
            'venue',
            sprintf('Updated venue: %s', $venue->venue_name),
            $venue->venue_id,
            $venue->venue_name,
        );

        return response()->json([
            'venue' => $venue,
            'message' => 'Venue Successfully Updated.'
        ], 200);
    }

    public function destroyVenue(Request $request, Venue $venue) {
        $venue->update([
            'is_deleted' => true
        ]);

        ActivityLogger::log(
            $request,
            'deleted',
            'venue',
            sprintf('Deleted venue: %s', $venue->venue_name),
            $venue->venue_id,
            $venue->venue_name,
        );

        return response()->json([
            'message' => 'Venue Successfully Deleted.'
        ], 200);
    }
}
