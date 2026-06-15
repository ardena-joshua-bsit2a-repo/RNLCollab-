import { useEffect, useState } from "react"
import EventService from "../../../services/EventService"
import Spinner from "../../../components/Spinner/Spinner"
import { exportBookingSummaryReport } from "../../Dashboard/utils/pdfExport"

const BookingSummaryReport = () => {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [groupBy, setGroupBy] = useState<"department" | "venue">("department")
    const [filterDepartment, setFilterDepartment] = useState<string>("all")
    const [filterVenue, setFilterVenue] = useState<string>("all")

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await EventService.loadAllEventsForReport()
                if (res.status === 200) setEvents(res.data.events)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Unique departments and venues for filter dropdowns
    const departments = [...new Set(events.map(e => e.department?.department_name ?? "No Department"))]
    const venues = [...new Set(events.map(e => e.venue?.venue_name ?? "No Venue"))]

    // Apply filters
    const filteredEvents = events.filter(e => {
        const deptMatch = filterDepartment === "all" || (e.department?.department_name ?? "No Department") === filterDepartment
        const venueMatch = filterVenue === "all" || (e.venue?.venue_name ?? "No Venue") === filterVenue
        return deptMatch && venueMatch
    })

    const approved = filteredEvents.filter(e => e.status === "approved").length
    const rejected = filteredEvents.filter(e => e.status === "rejected").length
    const pending  = filteredEvents.filter(e => e.status === "pending").length

    // Group by department or venue
    const grouped: Record<string, { approved: number; rejected: number; pending: number }> = {}
    filteredEvents.forEach(e => {
        const key = groupBy === "department"
            ? (e.department?.department_name ?? "No Department")
            : (e.venue?.venue_name ?? "No Venue")
        if (!grouped[key]) grouped[key] = { approved: 0, rejected: 0, pending: 0 }
        if (e.status === "approved") grouped[key].approved++
        else if (e.status === "rejected") grouped[key].rejected++
        else grouped[key].pending++
    })

    // Sort by total bookings descending
    const sortedGrouped = Object.entries(grouped).sort(
        ([, a], [, b]) => (b.approved + b.rejected + b.pending) - (a.approved + a.rejected + a.pending)
    )

    const hasActiveFilter = filterDepartment !== "all" || filterVenue !== "all"

    return (
        <div className="space-y-6">

            {/* Controls */}
            <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap gap-3 items-end justify-between">
                <div className="flex flex-wrap gap-3 items-end">

                    {/* Group By */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Group By</label>
                        <select value={groupBy}
                            onChange={e => setGroupBy(e.target.value as "department" | "venue")}
                            className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="department">Department</option>
                            <option value="venue">Venue</option>
                        </select>
                    </div>

                    {/* Filter by Department */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Filter Department</label>
                        <select value={filterDepartment}
                            onChange={e => setFilterDepartment(e.target.value)}
                            className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter by Venue */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Filter Venue</label>
                        <select value={filterVenue}
                            onChange={e => setFilterVenue(e.target.value)}
                            className="border border-gray-600 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Venues</option>
                            {venues.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilter && (
                        <button type="button"
                            onClick={() => { setFilterDepartment("all"); setFilterVenue("all") }}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition"
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>

                <button type="button"
                    onClick={() => exportBookingSummaryReport(filteredEvents)}
                    disabled={loading || filteredEvents.length === 0}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                >
                    Export PDF
                </button>
            </div>

            {/* Active filter badge */}
            {hasActiveFilter && (
                <div className="flex flex-wrap gap-2 text-xs">
                    {filterDepartment !== "all" && (
                        <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
                            Dept: {filterDepartment}
                        </span>
                    )}
                    {filterVenue !== "all" && (
                        <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full">
                            Venue: {filterVenue}
                        </span>
                    )}
                </div>
            )}

            {/* Overall summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total",    value: filteredEvents.length, color: "bg-blue-600" },
                    { label: "Approved", value: approved,               color: "bg-green-600" },
                    { label: "Rejected", value: rejected,               color: "bg-red-600" },
                    { label: "Pending",  value: pending,                color: "bg-amber-500" },
                ].map(card => (
                    <div key={card.label} className={`${card.color} rounded-lg p-4 text-white`}>
                        <p className="text-xs font-medium opacity-80 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold">{loading ? "—" : card.value}</p>
                    </div>
                ))}
            </div>

            {/* Grouped table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-950 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">{groupBy === "department" ? "Department" : "Venue"}</th>
                            <th className="px-4 py-3 text-green-400">Approved</th>
                            <th className="px-4 py-3 text-red-400">Rejected</th>
                            <th className="px-4 py-3 text-amber-400">Pending</th>
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center"><Spinner size="md" /></td></tr>
                        ) : sortedGrouped.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No data found.</td></tr>
                        ) : (
                            sortedGrouped.map(([key, counts], index) => {
                                const total = counts.approved + counts.rejected + counts.pending
                                const isTop = index === 0 && sortedGrouped.length > 1
                                return (
                                    <tr key={key} className={`hover:bg-gray-800 ${isTop ? "bg-gray-800/50" : ""}`}>
                                        <td className="px-4 py-3 text-gray-500">
                                            {isTop
                                                ? <span className="text-yellow-400 font-bold">🏆</span>
                                                : <span>{index + 1}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">
                                            {key}
                                            {isTop && (
                                                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Most Bookings</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-green-400">{counts.approved}</td>
                                        <td className="px-4 py-3 text-red-400">{counts.rejected}</td>
                                        <td className="px-4 py-3 text-amber-400">{counts.pending}</td>
                                        <td className="px-4 py-3 text-white font-semibold">{total}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BookingSummaryReport