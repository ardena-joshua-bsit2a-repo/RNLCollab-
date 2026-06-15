import { useEffect, useState } from "react"
import EventService from "../../../services/EventService"
import VenueService from "../../../services/VenueService"
import DepartmentService from "../../../services/DepartmentService"
import type { EventColumns } from "../../../interfaces/EventInterface"
import type { VenueColumns } from "../../../interfaces/VenueInterface"
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface"
import Spinner from "../../../components/Spinner/Spinner"
import { exportEventsReport } from "../../Dashboard/utils/pdfExport"
import { CheckCircle, XCircle, Clock } from "lucide-react"

// ─── Pagination helper ────────────────────────────────────────────────────────
function getPaginationRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4)        return [1, 2, 3, 4, 5, "...", total]
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
}

const ITEMS_PER_PAGE = 10

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; icon: JSX.Element; cls: string }> = {
        approved: {
            label: "Approved",
            icon: <CheckCircle size={12} />,
            cls: "bg-green-500/15 text-green-400 border border-green-500/20",
        },
        rejected: {
            label: "Rejected",
            icon: <XCircle size={12} />,
            cls: "bg-red-500/15 text-red-400 border border-red-500/20",
        },
        pending: {
            label: "Pending",
            icon: <Clock size={12} />,
            cls: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        },
    }
    const s = map[status] ?? {
        label: status,
        icon: null,
        cls: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
    }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
            {s.icon}
            {s.label}
        </span>
    )
}

const EventsReport = () => {
    const [events, setEvents]   = useState<EventColumns[]>([])
    const [venues, setVenues]   = useState<VenueColumns[]>([])
    const [depts, setDepts]     = useState<DepartmentsColumns[]>([])
    const [loading, setLoading] = useState(false)

    const [dateFrom,     setDateFrom]     = useState("")
    const [dateTo,       setDateTo]       = useState("")
    const [filterVenue,  setFilterVenue]  = useState("")
    const [filterDept,   setFilterDept]   = useState("")
    const [filterStatus, setFilterStatus] = useState("")

    // ─── Pagination ───────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [evRes, vRes, dRes] = await Promise.all([
                    EventService.loadAllEventsForReport(),
                    VenueService.loadVenue(),
                    DepartmentService.loadDepartment(),
                ])
                if (evRes.status === 200) setEvents(evRes.data.events)
                if (vRes.status === 200)  setVenues(vRes.data.venues)
                if (dRes.status === 200)  setDepts(dRes.data.departments)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Reset to page 1 whenever filters change
    useEffect(() => { setCurrentPage(1) }, [dateFrom, dateTo, filterVenue, filterDept, filterStatus])

    const filtered = events.filter(e => {
        const matchVenue  = !filterVenue  || e.venue?.venue_name === filterVenue
        const matchDept   = !filterDept   || e.department?.department_name === filterDept
        const matchStatus = !filterStatus || e.status === filterStatus
        const matchFrom   = !dateFrom     || e.date >= dateFrom
        const matchTo     = !dateTo       || e.date <= dateTo
        return matchVenue && matchDept && matchStatus && matchFrom && matchTo
    })

    const totalPages      = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedEvents = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )
    const paginationRange = getPaginationRange(currentPage, totalPages)

    const handleTimeFormat = (time: string) =>
        new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const clearFilters = () => {
        setDateFrom(""); setDateTo(""); setFilterVenue(""); setFilterDept(""); setFilterStatus("")
    }

    return (
        <div className="space-y-4">

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap gap-3 items-end">
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
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Venue</label>
                    <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Venues</option>
                        {venues.map(v => <option key={v.venue_id} value={v.venue_name}>{v.venue_name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Department</label>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Departments</option>
                        {depts.map(d => <option key={d.department_id} value={d.department_name}>{d.department_name}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                {(dateFrom || dateTo || filterVenue || filterDept || filterStatus) && (
                    <button type="button" onClick={clearFilters}
                        className="text-sm text-gray-400 hover:text-red-400 transition mt-4"
                    >
                        Clear
                    </button>
                )}
                <div className="ml-auto mt-4">
                    <button type="button"
                        onClick={() => exportEventsReport(filtered, { dateFrom, dateTo, venue: filterVenue, department: filterDept })}
                        disabled={loading || filtered.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="flex gap-4 text-sm">
                <span className="text-gray-400">Showing <span className="text-white font-medium">{filtered.length}</span> events</span>
                <span className="text-green-400">{filtered.filter(e => e.status === "approved").length} approved</span>
                <span className="text-red-400">{filtered.filter(e => e.status === "rejected").length} rejected</span>
                <span className="text-amber-400">{filtered.filter(e => e.status === "pending").length} pending</span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-950 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Requested By</th>
                                <th className="px-4 py-3">Venue</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center"><Spinner size="md" /></td></tr>
                            ) : paginatedEvents.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No events found.</td></tr>
                            ) : (
                                paginatedEvents.map((e, i) => (
                                    <tr key={e.event_id} className="hover:bg-gray-800">
                                        <td className="px-4 py-3 text-gray-500">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3">{e.activity_title}</td>
                                        <td className="px-4 py-3">{e.date}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {handleTimeFormat(e.time_start)} – {handleTimeFormat(e.time_end)}
                                        </td>
                                        <td className="px-4 py-3">{e.requested_by}</td>
                                        <td className="px-4 py-3">{e.venue?.venue_name ?? "—"}</td>
                                        <td className="px-4 py-3">{e.department?.department_name ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={e.status} />
                                        </td>
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
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} events
                        </p>

                        <div className="flex items-center gap-1.5">
                            {/* Previous */}
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-gray-700 transition"
                            >
                                Previous
                            </button>

                            {/* Page numbers with ellipsis */}
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

                            {/* Next */}
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

export default EventsReport