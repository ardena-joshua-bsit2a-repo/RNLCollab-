import type { DepartmentsColumns } from "./DepartmentInterface";
import type { RoleColumns } from "./RoleInterface";


export interface UserColumns {
    user_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix_name?: string;
    profile_photo?: string | null; 
    status: string;
    role: RoleColumns;
    department: DepartmentsColumns;
    email: string;
    username: string;
    password: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserFieldErrors {
    first_name?: string[];
    middle_name?: string[];
    last_name?: string[];
    suffix_name?: string[];
    email?: string[];
    role?: string[];
    department?: string[];
    username?: string[];
    password?: string[];
    password_confirmation?: string[];
}