export interface ActivityLogUser {
    user_id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix_name?: string | null;
    username: string;
    email: string;
    role?: {
        role_id: number;
        role_name: string;
    };
}

export interface ActivityLog {
    activity_log_id: number;
    user_id: number | null;
    action: string;
    module: string;
    description: string;
    subject_id: number | null;
    subject_label: string | null;
    ip_address: string | null;
    created_at: string;
    user?: ActivityLogUser | null;
}

export interface ActivityLogFilters {
    module?: string;
    action?: string;
    user_id?: number;
}
