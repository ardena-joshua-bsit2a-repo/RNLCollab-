import { useAuth, getUserDisplayName } from "../../contexts/AuthContext";

const DashboardPage = () => {
    const { user, isSuperAdmin } = useAuth();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="text-gray-300">
                Welcome back, {getUserDisplayName(user)}.
            </p>
            <div className="bg-gray-900 border border-default-medium rounded-lg p-4 text-sm text-gray-300 space-y-2">
                <p><span className="text-gray-500">Role:</span> {user?.role?.role_name}</p>
                <p><span className="text-gray-500">Department:</span> {user?.department?.department_name}</p>
                <p>
                    <span className="text-gray-500">Access:</span>{" "}
                    {isSuperAdmin
                        ? "Full administration (users, roles, departments, events, venues)"
                        : "Events and venues"}
                </p>
            </div>
        </div>
    );
};

export default DashboardPage;
