import { useCallback, useEffect, useState, type FC } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";
import Spinner from "../../../components/Spinner/Spinner";
import ActivityLogService from "../../../services/ActivityLogService";
import UserService from "../../../services/UserService";
import {
    Activity,
    RefreshCw,
    Search,
    LogIn,
    Plus,
    Pencil,
    Trash,
    RotateCcw,
    Trash2,
    Eye,
    XCircle,
    CheckCircle,
    LogOut,
} from "lucide-react";
import type {
    ActivityLog,
    ActivityLogFilters,
} from "../../../interfaces/ActivityLogInterface";
import type { UserColumns } from "../../../interfaces/UserInterface";

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
        case "login":     return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
        case "logout":    return "bg-slate-500/15 text-slate-300 border border-slate-500/20";
        case "created":   return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
        case "updated":   return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
        case "approved":  return "bg-green-500/15 text-green-400 border border-green-500/20";
        case "rejected":  return "bg-rose-500/15 text-rose-400 border border-rose-500/20";
        case "viewed":
        case "view":      return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20";
        case "deleted":
        case "cancelled": return "bg-orange-500/15 text-orange-400 border border-orange-500/20";
        case "restored":  return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20";
        case "force_deleted": return "bg-red-500/15 text-red-400 border border-red-500/20";
        default:          return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }
};

const actionIcons = {
    login: LogIn,
    logout: LogOut,
    created: Plus,
    updated: Pencil,
    approved: CheckCircle,
    rejected: XCircle,
    viewed: Eye,
    view: Eye,
    deleted: Trash,
    restored: RotateCcw,
    force_deleted: Trash2,
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
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

// ─── Pagination helper: returns page numbers with ellipsis ───────────────────
function getPaginationRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const range: (number | "...")[] = [];

    if (current <= 4) {
        range.push(1, 2, 3, 4, 5, "...", total);
    } else if (current >= total - 3) {
        range.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
        range.push(1, "...", current - 1, current, current + 1, "...", total);
    }

    return range;
}

const ITEMS_PER_PAGE = 10;

const ActivityLogList: FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [moduleFilter, setModuleFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // ─── User map for profile photos ──────────────────────────────────────────
    const [userMap, setUserMap] = useState<Record<number, UserColumns>>({});

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const filters: ActivityLogFilters = {};
            if (moduleFilter) filters.module = moduleFilter;
            if (actionFilter) filters.action = actionFilter;
            const res = await ActivityLogService.loadActivityLogs(filters);
            if (res.status === 200) setLogs(res.data.logs);
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setLoading(false);
        }
    }, [moduleFilter, actionFilter]);

    // Load users once so we can look up profile photos
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await UserService.loadUsers();
                if (res.status === 200) {
                    const map: Record<number, UserColumns> = {};
                    res.data.users.forEach((u: UserColumns) => { map[u.user_id] = u; });
                    setUserMap(map);
                }
            } catch (e) {
                console.error("Failed to load users for avatars:", e);
            }
        };
        loadUsers();
    }, []);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, moduleFilter, actionFilter]);

    const filteredLogs = logs.filter((log) => {
        const query = searchQuery.toLowerCase();
        return (
            formatUserName(log).toLowerCase().includes(query) ||
            log.description?.toLowerCase().includes(query) ||
            log.module?.toLowerCase().includes(query) ||
            log.action?.toLowerCase().includes(query) ||
            log.user?.username?.toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const paginationRange = getPaginationRange(currentPage, totalPages);

    // ─── Avatar renderer (profile photo if available, else initial circle) ───
    const getProfilePhotoUrl = (path: string) => {
        if (path.startsWith("http")) return path;
        return `${import.meta.env.VITE_BACKEND_URL}${path}`;
    };

    const renderAvatar = (log: ActivityLog) => {
        const userId = log.user?.user_id;
        const matchedUser = userId ? userMap[userId] : null;
        const initials = formatUserName(log)?.charAt(0)?.toUpperCase() ?? "?";

        if (matchedUser?.profile_photo) {
            return (
                <img
                    src={getProfilePhotoUrl(matchedUser.profile_photo)}
                    alt={initials}
                    className="h-10 w-10 rounded-full object-cover"
                />
            );
        }

        return (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                {initials}
            </div>
        );
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-2xl bg-blue-500/10 p-3">
                            <Activity className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Activity Logs</h1>
                            <p className="mt-1 text-gray-400">Monitor user actions and system activities.</p>
                        </div>
                    </div>
                    <button
                        onClick={loadLogs}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                        <RefreshCw size={16} />
                        Refresh Logs
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <p className="text-sm text-gray-400">Total Logins</p>
                    <div className="mt-3 flex items-center gap-3">
                        <LogIn className="text-emerald-400" />
                        <span className="text-3xl font-bold text-white">
                            {filteredLogs.filter((x) => x.action === "login").length}
                        </span>
                    </div>
                </div>
                <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
                    <p className="text-sm text-gray-400">Created Records</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Plus className="text-blue-400" />
                        <span className="text-3xl font-bold text-white">
                            {filteredLogs.filter((x) => x.action === "created").length}
                        </span>
                    </div>
                </div>
                <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-5">
                    <p className="text-sm text-gray-400">Updated Records</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Pencil className="text-amber-400" />
                        <span className="text-3xl font-bold text-white">
                            {filteredLogs.filter((x) => x.action === "updated").length}
                        </span>
                    </div>
                </div>
                <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-5">
                    <p className="text-sm text-gray-400">Deleted Records</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Trash className="text-red-400" />
                        <span className="text-3xl font-bold text-white">
                            {filteredLogs.filter((x) => x.action === "deleted" || x.action === "force_deleted").length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="relative flex-1 min-w-[250px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        placeholder="Search activity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    />
                </div>
                <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 focus:border-blue-400 bg-black/20 px-4 py-3 text-white [&>option]:bg-gray-900 [&>option]:text-white"
                >
                    {MODULE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 focus:border-blue-400 bg-black/20 px-4 py-3 text-white [&>option]:bg-gray-900 [&>option]:text-white"
                >
                    {ACTION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <div className="max-h-[calc(100vh-16rem)] overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 border-b border-white/10 bg-black/50 text-xs text-gray-300 backdrop-blur-xl">
                            <TableRow>
                                <TableCell isHeader className="px-4 py-3 text-center font-medium whitespace-nowrap">#</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-start font-medium whitespace-nowrap">DATE & TIME</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-start font-medium whitespace-nowrap">USER</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-center font-medium whitespace-nowrap">ROLE</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-center font-medium whitespace-nowrap">ACTION</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-center font-medium whitespace-nowrap">MODULE</TableCell>
                                <TableCell isHeader className="min-w-[240px] px-4 py-3 text-start font-medium">DESCRIPTION</TableCell>
                                <TableCell isHeader className="px-4 py-3 text-center font-medium whitespace-nowrap">IP</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-white/5 text-sm text-gray-300">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="px-4 py-10 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                        No activity logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <TableRow
                                        key={log.activity_log_id}
                                        className="transition-colors hover:bg-white/[0.03]"
                                    >
                                        <TableCell className="px-4 py-3 text-center text-gray-500">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {renderAvatar(log)}
                                                <div>
                                                    <div className="font-medium text-white">{formatUserName(log)}</div>
                                                    <div className="text-xs text-gray-400">@{log.user?.username}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {log.user?.role?.role_name ?? "—"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {(() => {
                                                const Icon = actionIcons[log.action as keyof typeof actionIcons];
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${actionBadgeClass(log.action)}`}>
                                                        {Icon && <Icon size={12} />}
                                                        {formatAction(log.action)}
                                                    </span>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {formatModule(log.module)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-300">
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

                {/* ─── Pagination with ellipsis ────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
                        <p className="text-sm text-gray-400">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} logs
                        </p>

                        <div className="flex items-center gap-1.5">
                            {/* Previous */}
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-white/10 transition"
                            >
                                Previous
                            </button>

                            {/* Page numbers with ellipsis */}
                            {paginationRange.map((page, i) =>
                                page === "..." ? (
                                    <span
                                        key={`ellipsis-${i}`}
                                        className="px-2 py-2 text-sm text-gray-500 select-none"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                                            currentPage === page
                                                ? "bg-blue-600 text-white"
                                                : "border border-white/10 bg-black/20 text-white hover:bg-white/10"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            {/* Next */}
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-white/10 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ActivityLogList;