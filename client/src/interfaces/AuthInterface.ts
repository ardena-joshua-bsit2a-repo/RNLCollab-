export interface AuthRole {
    role_id: number;
    role_name: string;
    role_description?: string;
    status: string;
}

export interface AuthDepartment {
    department_id: number;
    department_name: string;
    department_description?: string;
    status: string;
}

export interface AuthUser {
    user_id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix_name?: string | null;
    email: string;
    username: string;
    status: string;
    role_id: number;
    department_id: number;
    role?: AuthRole;
    department?: AuthDepartment;
}

export interface LoginCredentials {
    username: string;
    password: string;
}
