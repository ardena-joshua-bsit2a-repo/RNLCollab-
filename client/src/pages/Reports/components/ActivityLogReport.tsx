import { useEffect, useState } from "react"
import ActivityLogService from "../../../services/ActivityLogService"
import type { ActivityLog } from "../../../interfaces/ActivityLogInterface"
import Spinner from "../../../components/Spinner/Spinner"
import { exportActivityLogReport } from "../../Dashboard/utils/pdfExport"
import {
    LogIn, LogOut, Plus, Pencil, Trash, RotateCcw, Trash2,
    Eye, CheckCircle, XCircle, Ban,
} from "lucide-react"

// ─── Pagination helper ────────────────────────────────────────────────────────
function getPaginationRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4)         return [1, 2, 3, 4, 5, "...", total]
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
}

const ITEMS_PER_PAGE = 10

// ─── Action badge config ──────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { icon: JSX.Element; cls: string }> = {
    login:        { icon: <LogIn size={12} />,       cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
    logout:       { icon: <LogOut size={12} />,      cls: "bg-slate-500/15 text-slate-300 border border-slate-500/20" },
    created:      { icon: <Plus size={12} />,        cls: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
    updated:      { icon: <Pencil size={12} />,      cls: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
    approved:     { icon: <CheckCircle size={12} />, cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
    rejected:     { icon: <XCircle size={12} />,     cls: "bg-rose-500/15 text-rose-400 border border-rose-500/20" },
    viewed:       { icon: <Eye size={12} />,         cls: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" },
    view:         { icon: <Eye size={12} />,         cls: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" },
    deleted:      { icon: <Trash size={12} />,       cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20" },
    cancelled:    { icon: <Ban size={12} />,         cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20" },
    restored:     { icon: <RotateCcw size={12} />,   cls: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" },
    force_deleted:{ icon: <Trash2 size={12} />,      cls: "bg-red-500/15 text-red-400 border border-red-500/20" },
}

const ActionBadge = ({ action }: { action: string }) => {
    const cfg = ACTION_CONFIG[action] ?? {
        icon: null,
        cls: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
    }
    const label = action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.cls}`}>
            {cfg.icon}
            {label}
        </span>
    )
}

// ─── Options ──────────────────────────────────────────────────────────────────
const MODULE_OPTIONS = [
    { value: "", label: "All modules" },
    { value: "auth",       label: "Authentication" },
    { value: "user",       label: "Users" },
    { value: "role",       label: "Roles" },
    { value: "department", label: "Departments" },
    { value: "venue",      label: "Venues" },
    { value: "event",      label: "Events" },
]

const ACTION_OPTIONS = [
    { value: "", label: "All actions" },
    { value: "login",        label: "Login" },
    { value: "logout",       label: "Logout" },
    { value: "created",      label: "Created" },
    { value: "updated",      label: "Updated" },
    { value: "deleted",      label: "Deleted" },
    { value: "restored",     label: "Restored" },
    { value: "force_deleted",label: "Permanently deleted" },
    { value: "approved",     label: "Approved" },
    { value: "rejected",     label: "Rejected" },
    { value: "cancelled",    label: "Cancelled" },
]

const formatName = (log: ActivityLog) => {
    const u = log.user
    if (!u) return "System"
    return [u.first_name, u.middle_name, u.last_name, u.suffix_name].filter(Boolean).join(" ")
}

const ActivityLogReport = () => {
    const [logs, setLogs]     = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(false)

    const [moduleFilter, setModuleFilter] = useState("")
    const [actionFilter, setActionFilter] = useState("")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo,   setDateTo]   = useState("")

    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await ActivityLogService.loadActivityLogs({})
                if (res.status === 200) setLogs(res.data.logs)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Reset to page 1 when filters change
    useEffect(() => { setCurrentPage(1) }, [moduleFilter, actionFilter, dateFrom, dateTo])

    const filtered = logs.filter(log => {
        const matchModule = !moduleFilter || log.module === moduleFilter
        const matchAction = !actionFilter || log.action === actionFilter
        const logDate = log.created_at.slice(0, 10)
        const matchFrom = !dateFrom || logDate >= dateFrom
        const matchTo   = !dateTo   || logDate <= dateTo
        return matchModule && matchAction && matchFrom && matchTo
    })

    const totalPages    = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedLogs = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )
    const paginationRange = getPaginationRange(currentPage, totalPages)

    const clearFilters = () => {
        setModuleFilter(""); setActionFilter(""); setDateFrom(""); setDateTo("")
    }

    return (
        <div className="space-y-4">

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Module</label>
                    <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MODULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Action</label>
                    <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Date From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Date To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {(moduleFilter || actionFilter || dateFrom || dateTo) && (
                    <button type="button" onClick={clearFilters}
                        className="text-sm text-gray-400 hover:text-red-400 transition mt-4"
                    >
                        Clear
                    </button>
                )}
                <div className="ml-auto mt-4">
                    <button type="button"
                        onClick={() => exportActivityLogReport(filtered)}
                        disabled={loading || filtered.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{filtered.length}</span> log entries
            </p>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-950 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Date & Time</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Module</th>
                                <th className="px-4 py-3 min-w-[200px]">Description</th>
                                <th className="px-4 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center"><Spinner size="md" /></td></tr>
                            ) : paginatedLogs.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No logs found.</td></tr>
                            ) : (
                                paginatedLogs.map((log, i) => (
                                    <tr key={log.activity_log_id} className="hover:bg-gray-800">
                                        <td className="px-4 py-3 text-gray-500">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString("en-PH")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white">{formatName(log)}</div>
                                            {log.user?.username && (
                                                <div className="text-xs text-gray-500">@{log.user.username}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{log.user?.role?.role_name ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <ActionBadge action={log.action} />
                                        </td>
                                        <td className="px-4 py-3 capitalize">{log.module}</td>
                                        <td className="px-4 py-3 text-gray-400">{log.description}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{log.ip_address ?? "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Pagination ───────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-700 bg-gray-900 px-6 py-4">
                        <p className="text-sm text-gray-400">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} logs
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-gray-700 transition"
                            >
                                Previous
                            </button>

                            {paginationRange.map((page, idx) =>
                                page === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-500 select-none">…</span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                                            currentPage === page
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-gray-700 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default ActivityLogReport