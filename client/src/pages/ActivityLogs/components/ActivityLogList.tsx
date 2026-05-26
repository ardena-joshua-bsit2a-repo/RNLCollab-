import { useCallback, useEffect, useState, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table";
import Spinner from "../../../components/Spinner/Spinner";
import ActivityLogService from "../../../services/ActivityLogService";
import type { ActivityLog, ActivityLogFilters } from "../../../interfaces/ActivityLogInterface";

const MODULE_OPTIONS = [
    { value: "", label: "All modules" },
    { value: "auth", label: "Authentication" },
    { value: "user", label: "Users" },
    { value: "role", label: "Roles" },
    { value: "department", label: "Departments" },
    { value: "venue", label: "Venues" },
    { value: "event", label: "Events" },
];

const ACTION_OPTIONS = [
    { value: "", label: "All actions" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "created", label: "Created" },
    { value: "updated", label: "Updated" },
    { value: "deleted", label: "Deleted" },
    { value: "restored", label: "Restored" },
    { value: "force_deleted", label: "Permanently deleted" },
];

const actionBadgeClass = (action: string) => {
    switch (action) {
        case "login":
            return "bg-emerald-100 text-emerald-800";
        case "logout":
            return "bg-slate-200 text-slate-700";
        case "created":
            return "bg-blue-100 text-blue-800";
        case "updated":
            return "bg-amber-100 text-amber-800";
        case "deleted":
            return "bg-orange-100 text-orange-800";
        case "restored":
            return "bg-cyan-100 text-cyan-800";
        case "force_deleted":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const formatAction = (action: string) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatModule = (module: string) =>
    module.charAt(0).toUpperCase() + module.slice(1);

const formatUserName = (log: ActivityLog) => {
    const u = log.user;
    if (!u) return "System";
    const parts = [u.first_name, u.middle_name, u.last_name, u.suffix_name].filter(Boolean);
    return parts.join(" ");
};

const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const ActivityLogList: FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [moduleFilter, setModuleFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const filters: ActivityLogFilters = {};
            if (moduleFilter) filters.module = moduleFilter;
            if (actionFilter) filters.action = actionFilter;

            const res = await ActivityLogService.loadActivityLogs(filters);
            if (res.status === 200) {
                setLogs(res.data.logs);
            }
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setLoading(false);
        }
    }, [moduleFilter, actionFilter]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Activity Logs</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Track sign-ins and actions by users and administrators.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadLogs}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 rounded-lg transition cursor-pointer shrink-0"
                >
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-900 text-sm text-white px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                    {MODULE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-900 text-sm text-white px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                    {ACTION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="max-w-full max-h-[calc(100vh-16rem)] overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-200 bg-gray-950 sticky top-0 text-white text-xs">
                            <TableRow>
                                <TableCell isHeader className="px-4 py-3 font-medium text-center whitespace-nowrap">
                                    #
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-start whitespace-nowrap">
                                    DATE & TIME
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-start whitespace-nowrap">
                                    USER
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-center whitespace-nowrap">
                                    ROLE
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-center whitespace-nowrap">
                                    ACTION
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-center whitespace-nowrap">
                                    MODULE
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-start min-w-[240px]">
                                    DESCRIPTION
                                </TableCell>
                                <TableCell isHeader className="px-4 py-3 font-medium text-center whitespace-nowrap">
                                    IP
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 text-gray-600 text-sm">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="px-4 py-8 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        No activity logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, index) => (
                                    <TableRow key={log.activity_log_id} className="hover:bg-gray-50">
                                        <TableCell className="px-4 py-3 text-center text-gray-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium text-gray-800">
                                                {formatUserName(log)}
                                            </div>
                                            {log.user?.username && (
                                                <div className="text-xs text-gray-500">
                                                    @{log.user.username}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {log.user?.role?.role_name ?? "—"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${actionBadgeClass(log.action)}`}
                                            >
                                                {formatAction(log.action)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {formatModule(log.module)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-700">
                                            {log.description}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center text-xs text-gray-500">
                                            {log.ip_address ?? "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogList;
