export interface VenueColumns {
    venue_id: number;
    venue_name:string;
    venue_description: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface VenueFieldErrors {
    venue?: string[];
    venue_description: string;
}