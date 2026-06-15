import { useEffect, useState, type FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/Table";
import EventService from "../../../services/EventService";
import Spinner from "../../../components/Spinner/Spinner";
import type { EventColumns } from "../../../interfaces/EventInterface";
import { useAuth } from "../../../contexts/AuthContext";
import { CalendarDays, CheckCircle, Clock3, Plus, RefreshCw, Search, XCircle } from "lucide-react";

interface EventListProps {
  onAddEvent: () => void;
  onEditEvent: (event: EventColumns | null) => void;
  onDeleteEvent: (event: EventColumns | null) => void;
  onViewEvent: (event: EventColumns | null) => void;
  refreshKey: boolean;
}

const EventList: FC<EventListProps> = ({
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEvent,
  refreshKey,
}) => {
  const { isSuperAdmin } = useAuth();

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [events, setEvents] = useState<EventColumns[]>([]);

  // Filter state
  const [search, setSearch] = useState("");
  const [filterVenue, setFilterVenue] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleLoadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = isSuperAdmin
        ? await EventService.loadEvent()
        : await EventService.loadUserEvents();
      if (res.status === 200) setEvents(res.data.events);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleTimeFormat = (time: string) =>
    new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    handleLoadEvents();
  }, [refreshKey]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterVenue, filterDept, filterStatus, dateFrom, dateTo]);

  // Unique filter options from loaded data
  const venues = [
    ...new Set(
      events
        .map((e) => e.venue?.venue_name)
        .filter((v): v is string => Boolean(v))
    ),
  ];
  const depts = [
    ...new Set(
      events
        .map((e) => e.department?.department_name)
        .filter((d): d is string => Boolean(d))
    ),
  ];

  // Apply all filters
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      !search ||
      e.activity_title.toLowerCase().includes(search.toLowerCase()) ||
      e.requested_by.toLowerCase().includes(search.toLowerCase());
    const matchVenue = !filterVenue || e.venue?.venue_name === filterVenue;
    const matchDept = !filterDept || e.department?.department_name === filterDept;
    const matchStatus = !filterStatus || e.status === filterStatus;
    const eventDate = new Date(e.date);
    const matchDateFrom = !dateFrom || eventDate >= new Date(dateFrom);
    const matchDateTo = !dateTo || eventDate <= new Date(dateTo);

    return matchSearch && matchVenue && matchDept && matchStatus && matchDateFrom && matchDateTo;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <CalendarDays className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Event Management</h1>
              <p className="mt-1 text-gray-400">Manage schedules, approvals, and event requests.</p>
            </div>
          </div>

          <button
            onClick={handleLoadEvents}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
          <p className="text-sm text-gray-400">All Events</p>
          <div className="mt-3 flex items-center gap-3">
            <CalendarDays className="text-blue-400" />
            <span className="text-3xl font-bold text-white">{filteredEvents.length}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-green-500/10 bg-green-500/5 p-5">
          <p className="text-sm text-gray-400">Approved</p>
          <div className="mt-3 flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            <span className="text-3xl font-bold text-white">
              {filteredEvents.filter((e) => e.status === "approved").length}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-5">
          <p className="text-sm text-gray-400">Pending</p>
          <div className="mt-3 flex items-center gap-3">
            <Clock3 className="text-amber-400" />
            <span className="text-3xl font-bold text-white">
              {filteredEvents.filter((e) => e.status === "pending").length}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-5">
          <p className="text-sm text-gray-400">Rejected</p>
          <div className="mt-3 flex items-center gap-3">
            <XCircle className="text-red-400" />
            <span className="text-3xl font-bold text-white">
              {filteredEvents.filter((e) => e.status === "rejected").length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white">Event Filters</h3>
          <button
            type="button"
            onClick={onAddEvent}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">

          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Title or requestor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Venue */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Venue</label>
            <select
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="">All Venues</option>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Department</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="">All Departments</option>
              {depts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Clear */}
          {(search || dateFrom || dateTo || filterVenue || filterDept || filterStatus) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
                setFilterVenue("");
                setFilterDept("");
                setFilterStatus("");
              }}
              className="h-[46px] px-4 text-sm text-gray-400 hover:text-red-400 transition"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
        <div className="max-h-[calc(100vh-16rem)] overflow-x-auto">
          <Table>

            <TableHeader className="sticky top-0 border-b border-white/10 bg-black/50 text-xs text-gray-300 backdrop-blur-xl">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-center">No.</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">TITLE</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">DATE</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">TIME</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">REQUESTED BY</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">VENUE</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left">DEPARTMENT</TableCell>
                <TableCell isHeader className="px-4 py-3 text-center">STATUS</TableCell>
                <TableCell isHeader className="px-4 py-3 text-center">ACTIONS</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/5 text-sm text-gray-300">
              {loadingEvents ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-10 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No events found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((event, index) => (
                  <TableRow key={index} className="hover:bg-white/5 transition">

                    <TableCell className="px-4 py-3 text-center text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    <TableCell className="px-4 py-3">{event.activity_title}</TableCell>
                    <TableCell className="px-4 py-3">{event.date}</TableCell>
                    <TableCell className="px-4 py-3">
                      {handleTimeFormat(event.time_start)} – {handleTimeFormat(event.time_end)}
                    </TableCell>
                    <TableCell className="px-4 py-3">{event.requested_by}</TableCell>
                    <TableCell className="px-4 py-3">{event.venue?.venue_name}</TableCell>
                    <TableCell className="px-4 py-3">{event.department?.department_name ?? "—"}</TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                        ${event.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : event.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                        {event.status ?? "pending"}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                        <div className="flex gap-3 justify-center">
                            <button
                            onClick={() => onViewEvent(event)}
                            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
                            >
                            View
                            </button>

                            {!isSuperAdmin && event.status === "pending" && (
                            <button
                                onClick={() => onEditEvent(event)}
                                className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                            >
                                Edit
                            </button>
                            )}

                            {isSuperAdmin && (
                            <button
                                onClick={() => onEditEvent(event)}
                                className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                            >
                                Edit
                            </button>
                            )}

                            {event.status === "pending" && (
                            <button
                                onClick={() => onDeleteEvent(event)}
                                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
                            >
                                {isSuperAdmin ? "Delete" : "Cancel"}
                            </button>
                            )}

                            {isSuperAdmin && event.status !== "pending" && (
                            <button
                                onClick={() => onDeleteEvent(event)}
                                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
                            >
                                Delete
                            </button>
                            )}
                        </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
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

export default EventList;