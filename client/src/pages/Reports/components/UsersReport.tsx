import { useEffect, useState } from "react"
import UserService from "../../../services/UserService"
import RoleService from "../../../services/RoleService"
import DepartmentService from "../../../services/DepartmentService"
import type { UserColumns } from "../../../interfaces/UserInterface"
import Spinner from "../../../components/Spinner/Spinner"
import { exportUsersReport } from "../../Dashboard/utils/pdfExport"

// ─── Pagination helper ────────────────────────────────────────────────────────
function getPaginationRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4)          return [1, 2, 3, 4, 5, "...", total]
    if (current >= total - 3)  return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
}

const ITEMS_PER_PAGE = 10

const UsersReport = () => {
    const [users, setUsers]     = useState<UserColumns[]>([])
    const [roles, setRoles]     = useState<any[]>([])
    const [depts, setDepts]     = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [filterRole, setFilterRole] = useState("")
    const [filterDept, setFilterDept] = useState("")
    const [filterDate, setFilterDate] = useState("")

    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [uRes, rRes, dRes] = await Promise.all([
                    UserService.loadUsers(),
                    RoleService.loadRoles(),
                    DepartmentService.loadDepartment(),
                ])
                if (uRes.status === 200) setUsers(uRes.data.users)
                if (rRes.status === 200) setRoles(rRes.data.roles)
                if (dRes.status === 200) setDepts(dRes.data.departments)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Reset to page 1 when filters change
    useEffect(() => { setCurrentPage(1) }, [filterRole, filterDept, filterDate])

    const formatName = (u: UserColumns) => {
        let name = u.middle_name
            ? `${u.last_name}, ${u.first_name} ${u.middle_name.charAt(0)}.`
            : `${u.last_name}, ${u.first_name}`
        if (u.suffix_name) name += ` ${u.suffix_name}`
        return name
    }

    const getInitials = (u: UserColumns) =>
        `${u.first_name.charAt(0)}${u.last_name.charAt(0)}`.toUpperCase()

    const getProfilePhotoUrl = (path: string) => {
        if (path.startsWith("http")) return path
        return `${import.meta.env.VITE_BACKEND_URL}${path}`
    }

    const filtered = users.filter(u => {
        const matchRole = !filterRole || u.role.role_id.toString() === filterRole
        const matchDept = !filterDept || u.department.department_id.toString() === filterDept
        const matchDate = !filterDate || new Date(u.created_at).toISOString().slice(0, 10) === filterDate
        return matchRole && matchDept && matchDate
    })

    const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedUsers = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )
    const paginationRange = getPaginationRange(currentPage, totalPages)

    return (
        <div className="space-y-4">

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Role</label>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Roles</option>
                        {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Department</label>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Departments</option>
                        {depts.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Date Created</label>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {(filterRole || filterDept || filterDate) && (
                    <button type="button"
                        onClick={() => { setFilterRole(""); setFilterDept(""); setFilterDate("") }}
                        className="text-sm text-gray-400 hover:text-red-400 transition mt-4"
                    >
                        Clear
                    </button>
                )}
                <div className="ml-auto mt-4">
                    <button type="button"
                        onClick={() => exportUsersReport(filtered)}
                        disabled={loading || filtered.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{filtered.length}</span> users
            </p>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-950 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Full Name</th>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Date Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center"><Spinner size="md" /></td></tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                paginatedUsers.map((u, i) => (
                                    <tr key={u.user_id} className="hover:bg-gray-800">
                                        <td className="px-4 py-3 text-gray-500">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>

                                        {/* Full Name with profile photo */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {u.profile_photo ? (
                                                    <img
                                                        src={getProfilePhotoUrl(u.profile_photo)}
                                                        alt={getInitials(u)}
                                                        className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
                                                        {getInitials(u)}
                                                    </div>
                                                )}
                                                <span>{formatName(u)}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">@{u.username}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">{u.role.role_name}</td>
                                        <td className="px-4 py-3">{u.department.department_name}</td>
                                        <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString("en-PH")}</td>
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
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
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

export default UsersReport