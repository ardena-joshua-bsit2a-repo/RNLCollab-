import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashnoard";

/**
 * DashboardPage — RBAC gate
 *
 * This is the single entry point for the /dashboard route.
 * It reads the role from AuthContext (set at login, verified server-side)
 * and renders the appropriate dashboard.
 *
 * ✅ Admin  → AdminDashboard  (all events, all users, approvals, conflicts, export)
 * ✅ User   → UserDashboard   (own bookings only, calendar reference layer)
 *
 * Neither child component receives props it shouldn't have:
 *  - UserDashboard never receives the full event list or user count.
 *  - AdminDashboard is never rendered for non-admin sessions.
 *
 * The real enforcement happens at the API/server layer —
 * EventService.loadUserEvents() is scoped to the authenticated user's ID
 * on the backend, so even a direct API call cannot retrieve other users' data.
 */
const DashboardPage = () => {
    const { isSuperAdmin } = useAuth();

    // Hard role gate — one line, no leakage
    if (isSuperAdmin) {
        return <AdminDashboard />;
    }

    return <UserDashboard />;
};

export default DashboardPage;