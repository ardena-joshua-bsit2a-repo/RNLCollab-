import { useEffect, useMemo, useRef, useState, type FC } from "react";
import EventService from "../../../services/EventService";
import type { EventColumns } from "../../../interfaces/EventInterface";
import {
    Building2,
    Users,
    RefreshCw,
    Search,
    HourglassIcon
} from "lucide-react";

interface AdminEventReviewListProps {
    onReviewEvent: (event: EventColumns) => void;
    refreshKey: boolean;
    // ✅ new
    autoOpenEventId?: number | null;
    onAutoOpenHandled?: () => void;
    openModal?: (event: EventColumns) => void;
}

const AdminEventReviewList: FC<AdminEventReviewListProps> = ({
    onReviewEvent,
    refreshKey,
    autoOpenEventId,
    onAutoOpenHandled,
    openModal,
}) => {
    const [events, setEvents] = useState<EventColumns[]>([])
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [venueFilter, setVenueFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const autoOpened = useRef(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadEvents = async () => {
        try {
            setLoading(true)
            const res = await EventService.loadPendingEvents()
            if (res.status === 200) {
                setEvents(res.data.events)
            }
        } catch (error) {
            console.error("Error loading events:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEvents()
    }, [refreshKey])

    // ✅ Once events are loaded, auto-open the modal if event_id is in the URL
    useEffect(() => {
        if (
            autoOpenEventId &&
            events.length > 0 &&
            !autoOpened.current &&
            openModal
        ) {
            const target = events.find(e => e.event_id === autoOpenEventId)
            if (target) {
                autoOpened.current = true
                openModal(target)
                onAutoOpenHandled?.()
            }
        }
    }, [events, autoOpenEventId])

    // Reset guard when autoOpenEventId changes (e.g. user clicks another notification)
    useEffect(() => {
        autoOpened.current = false
    }, [autoOpenEventId])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, venueFilter, dateFilter]);

    // Unique venues
    const venueOptions = useMemo(() => {
        const map = new Map<number, string>();
        events.forEach((e) => {
            if (e.venue?.venue_id) {
                map.set(e.venue.venue_id, e.venue.venue_name);
            }
        });
        return Array.from(map.entries());
    }, [events]);

    // Filtered events
    const filteredEvents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return events.filter((e) => {
            const matchesSearch =
                !query ||
                e.activity_title?.toLowerCase().includes(query) ||
                e.requested_by?.toLowerCase().includes(query) ||
                e.email?.toLowerCase().includes(query) ||
                e.venue?.venue_name?.toLowerCase().includes(query);

            const matchVenue =
                venueFilter === "" ||
                String(e.venue?.venue_id) === venueFilter;

            const matchDate =
                dateFilter === "" || e.date?.slice(0, 10) === dateFilter;

            return matchesSearch && matchVenue && matchDate;
        });
    }, [events, searchQuery, venueFilter, dateFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalUsers = useMemo(() => {
        const set = new Set(events.map((e) => e.requested_by));
        return set.size;
    }, [events]);

    const totalVenues = useMemo(() => {
        const set = new Set(events.map((e) => e.venue?.venue_id));
        return set.size;
    }, [events]);

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Event Approvals</h1>
                        <p className="mt-1 text-gray-400">
                            Review and manage pending event booking requests.
                        </p>
                    </div>

                    <button
                        onClick={loadEvents}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-yellow-500/10 bg-yellow-500/5 p-5">
                    <p className="text-sm text-gray-400">Pending Events</p>
                    <div className="mt-2 flex items-center gap-2">
                        <HourglassIcon className="text-yellow-400" />
                        <p className="text-3xl font-bold text-white">
                            {filteredEvents.filter((e) => e.status === "pending").length}
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <div className="mt-2 flex items-center gap-2">
                        <Users className="text-blue-400" />
                        <p className="text-3xl font-bold text-white">{totalUsers}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <p className="text-sm text-gray-400">Total Venues</p>
                    <div className="mt-2 flex items-center gap-2">
                        <Building2 className="text-emerald-400" />
                        <p className="text-3xl font-bold text-white">{totalVenues}</p>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="relative flex-1 min-w-[250px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        placeholder="Search event..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <select
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                    <option value="" className="bg-gray-900 text-white">All Venues</option>
                    {venueOptions.map(([id, name]) => (
                        <option key={id} value={String(id)} className="bg-gray-900 text-white">
                            {name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-sm text-gray-300">
                        <thead className="sticky top-0 bg-black/50 text-xs text-gray-400 backdrop-blur-xl border-b border-white/10">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Title</th>
                                <th className="p-3 text-left">Requested By</th>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Venue</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-400">
                                        No pending events
                                    </td>
                                </tr>
                            ) : (
                                paginatedEvents.map((event, index) => (
                                    <tr
                                        key={event.event_id}
                                        className="hover:bg-white/[0.03] transition-colors"
                                    >
                                        <td className="p-3 text-gray-500">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="p-3 text-white font-medium">
                                            {event.activity_title}
                                        </td>
                                        <td className="p-3">{event.requested_by}</td>
                                        <td className="p-3">{event.date}</td>
                                        <td className="p-3">{event.time_start} - {event.time_end}</td>
                                        <td className="p-3">{event.venue?.venue_name}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => onReviewEvent(event)}
                                                className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION — same pattern as UserList */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">

                        <p className="text-sm text-gray-400">
                            Showing{" "}
                            <span className="font-medium text-white">
                                {(currentPage - 1) * itemsPerPage + 1}
                            </span>
                            –
                            <span className="font-medium text-white">
                                {Math.min(currentPage * itemsPerPage, filteredEvents.length)}
                            </span>
                            {" "}of{" "}
                            <span className="font-medium text-white">
                                {filteredEvents.length}
                            </span>
                            {" "}events
                        </p>

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-white/10 transition"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                        currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "border border-white/10 bg-black/20 text-white hover:bg-white/10"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

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

export default AdminEventReviewList;