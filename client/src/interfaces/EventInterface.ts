import type { DepartmentsColumns } from "./DepartmentInterface";
import type { UserColumns } from "./UserInterface";
import type { VenueColumns } from "./VenueInterface";

export interface EventColumns {
    event_id: number;

    activity_title: string;
    activity_description?: string;

    date: string;
    number_of_days: number;

    time_start: string;
    time_end: string;

    requested_by: string;
    telephone_number?: string;
    email: string;

    user: UserColumns;
    venue: VenueColumns;
    department: DepartmentsColumns;

    user_id: number;
    venue_id: number;
    department_id: number;

    status?: "pending" | "approved" | "rejected";
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    rejection_reason?: string | null;

    is_deleted: boolean;

    created_at: string;
    updated_at: string;
}

export interface EventFieldErrors {
    activity_title?: string[];
    activity_description?: string[];

    date?: string[];
    number_of_days?: string[];

    time_start?: string[];
    time_end?: string[];

    requested_by?: string[];
    telephone_number?: string[];

    email?: string[];

    user_id?: string[];
    venue_id?: string[];
    department_id?: string[];
}