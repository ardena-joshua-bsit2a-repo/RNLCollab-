import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import AuthService from "../services/AuthService";
import type { AuthUser, LoginCredentials } from "../interfaces/AuthInterface";

const SUPER_ADMIN_ROLE = "Super Admin";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const persistToken = (token: string) => {
        localStorage.setItem("token", token);
    };

    const clearSession = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const fetchMe = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await AuthService.me();
            setUser(response.data.user);
        } catch {
            clearSession();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (credentials: LoginCredentials) => {
        const response = await AuthService.login(credentials);
        persistToken(response.data.token);
        setUser(response.data.user);
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } catch {
            // Clear local session even if API call fails
        } finally {
            clearSession();
        }
    };

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            isSuperAdmin: user?.role?.role_name === SUPER_ADMIN_ROLE,
            login,
            logout,
        }),
        [user, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const getUserDisplayName = (user: AuthUser | null) => {
    if (!user) return "";
    const parts = [user.first_name, user.middle_name, user.last_name, user.suffix_name]
        .filter(Boolean);
    return parts.join(" ");
};
