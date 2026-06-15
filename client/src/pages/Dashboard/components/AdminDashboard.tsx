import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays, CheckCircle, XCircle, Clock, Users, LayoutDashboard,
    ChevronLeft, ChevronRight, FileDown, MapPin, Building2, User, Layers,
    AlertTriangle, AlertCircle, ArrowRight, Filter,
} from "lucide-react";
import { getUserDisplayName, useAuth } from "../../../contexts/AuthContext";
import EventService from "../../../services/EventService";
import UserService from "../../../services/UserService";
import { exportBookingSummaryReport } from "../utils/pdfExport";

const getDaysInMonth     = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const formatTime = (t: string) => new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const timeToMinutes = (t: string): number => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// ✅ Moved to top level — outside any component
const expandMultiDayEvents = (events: any[]): any[] => {
    const expanded: any[] = [];
    events.forEach(event => {
        const days = parseInt(event.number_of_days) || 1;
        for (let i = 0; i < days; i++) {
            const date = new Date(event.date + "T00:00:00");
            date.setDate(date.getDate() + i);
            const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
            expanded.push({
                ...event,
                date: dateStr,
                _originalDate: event.date,
                _dayIndex: i + 1,
                _totalDays: days,
            });
        }
    });
    return expanded;
};

type ToastType = "success" | "error";
interface ToastState { message: string; type: ToastType; id: number; }

const Toast = ({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all
        ${toast.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
        {toast.type === "success" ? <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={18} className="text-red-400 flex-shrink-0" />}
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={onDismiss} className="ml-2 text-gray-500 hover:text-white transition text-lg leading-none">×</button>
    </div>
);

interface VenueConflict { date: string; venue: string; events: any[]; }

const eventsOverlap = (a: any, b: any): boolean => {
    const aStart = timeToMinutes(a.time_start), aEnd = timeToMinutes(a.time_end);
    const bStart = timeToMinutes(b.time_start), bEnd = timeToMinutes(b.time_end);
    return aStart < bEnd && bStart < aEnd;
};

const detectVenueConflicts = (events: any[]): VenueConflict[] => {
    const approved = events.filter(e => e.status === "approved");
    const conflicts: VenueConflict[] = [];
    for (let i = 0; i < approved.length; i++) {
        for (let j = i + 1; j < approved.length; j++) {
            const a = approved[i], b = approved[j];
            if (a.date === b.date && a.venue?.venue_name && a.venue.venue_name === b.venue?.venue_name && eventsOverlap(a, b)) {
                const existing = conflicts.find(c => c.date === a.date && c.venue === a.venue.venue_name);
                if (existing) { if (!existing.events.find((e: any) => e.event_id === b.event_id)) existing.events.push(b); }
                else conflicts.push({ date: a.date, venue: a.venue.venue_name, events: [a, b] });
            }
        }
    }
    return conflicts;
};

const wouldConflict = (pending: any, approved: any[]): any[] =>
    approved.filter(a => a.date === pending.date && a.venue?.venue_name && a.venue.venue_name === pending.venue?.venue_name && eventsOverlap(a, pending));

const StatCard = ({ label, value, icon, border, bg, iconColor, loading }: any) => (
    <div className={`rounded-3xl border ${border} ${bg} p-5`}>
        <p className="text-sm text-gray-400">{label}</p>
        <div className="mt-3 flex items-center gap-3">
            <span className={iconColor}>{icon}</span>
            <span className="text-3xl font-bold text-white">{loading ? <span className="text-gray-500 text-xl">—</span> : value}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [events,    setEvents]    = useState<any[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [loading,   setLoading]   = useState(true);
    const [toast,     setToast]     = useState<ToastState | null>(null);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToast({ message, type, id });
        setTimeout(() => setToast(t => t?.id === id ? null : t), 4000);
    };

    const [rejectingId,     setRejectingId]     = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading,   setActionLoading]   = useState(false);

    const today = new Date();
    const [calYear,  setCalYear]  = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState<string | null>(null);
    const [calView,  setCalView]  = useState<"month" | "week" | "day">("month");
    const [weekAnchor, setWeekAnchor] = useState<Date>(() => { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d; });
    const [filterVenue, setFilterVenue] = useState("");
    const [filterDept,  setFilterDept]  = useState("");

    const handlePrevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
    const handleNextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };
    const handlePrevWeek  = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
    const handleNextWeek  = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [evRes, usrRes] = await Promise.all([EventService.loadAllEventsForReport(), UserService.loadUsers()]);
            // ✅ expand multi-day events so calendar shows all days
            if (evRes.status === 200)  setEvents(expandMultiDayEvents(evRes.data.events));
            if (usrRes.status === 200) setUserCount(usrRes.data.users.length);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ✅ Fixed handleApprove — removed stray lines referencing undefined variables
    const handleApprove = async (eventId: number, title: string) => {
        try {
            setActionLoading(true);
            const res = await EventService.approveEvent(eventId);
            if (res.status === 200) { showToast(`"${title}" has been approved.`, "success"); await loadData(); }
        } catch { showToast("Failed to approve the booking. Please try again.", "error"); }
        finally { setActionLoading(false); }
    };

    const handleReject = async (eventId: number, title: string) => {
        if (!rejectionReason.trim()) return;
        try {
            setActionLoading(true);
            const res = await EventService.rejectEvent(eventId, rejectionReason);
            if (res.status === 200) {
                showToast(`"${title}" has been rejected.`, "error");
                setRejectingId(null); setRejectionReason(""); await loadData();
            }
        } catch { showToast("Failed to reject the booking. Please try again.", "error"); }
        finally { setActionLoading(false); }
    };

    const approved      = events.filter(e => e.status === "approved");
    const pending       = events.filter(e => e.status === "pending");
    const rejected      = events.filter(e => e.status === "rejected").length;
    const conflicts     = detectVenueConflicts(events);
    const conflictDates = new Set(conflicts.map(c => c.date));
    const todayStr      = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const venueOptions = [...new Set(events.map(e => e.venue?.venue_name).filter(Boolean))];
    const deptOptions  = [...new Set(events.map(e => e.department?.department_name).filter(Boolean))];

    const filteredApproved = approved.filter(e => {
        const matchVenue = !filterVenue || e.venue?.venue_name === filterVenue;
        const matchDept  = !filterDept  || e.department?.department_name === filterDept;
        return matchVenue && matchDept;
    });

    const approvedByDate: Record<string, any[]> = {};
    filteredApproved.forEach(e => {
        if (!approvedByDate[e.date]) approvedByDate[e.date] = [];
        approvedByDate[e.date].push(e);
    });

    const daysInMonth    = getDaysInMonth(calYear, calMonth);
    const firstDay       = getFirstDayOfMonth(calYear, calMonth);
    const selectedEvents = selected ? (approvedByDate[selected] ?? []) : [];
    const todayEvents    = approvedByDate[todayStr] ?? [];

    const upcomingEvents = filteredApproved
        .filter(e => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const getWeekDates = (): string[] => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekAnchor); d.setDate(d.getDate() + i);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });

    const weekDates   = getWeekDates();
    const weekStart   = weekDates[0];
    const weekEnd     = weekDates[6];
    const dayViewDate = selected ?? todayStr;
    const dayViewEvents = approvedByDate[dayViewDate] ?? [];

    return (
        <div className="space-y-6 text-slate-100">

            {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-blue-500/10 p-3"><LayoutDashboard className="h-6 w-6 text-blue-400" /></div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-400">Welcome back, <span className="font-medium text-white">{getUserDisplayName(user)}</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"><User size={14} className="text-blue-400" />{user?.role?.role_name ?? "—"}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"><Building2 size={14} className="text-cyan-400" />{user?.department?.department_name ?? "—"}</span>
                        <button onClick={() => exportBookingSummaryReport(events)} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25">
                            <FileDown size={15} /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                <StatCard label="Total Events" value={events.length}   loading={loading} icon={<Layers size={22}/>}      border="border-blue-500/10"    bg="bg-blue-500/5"    iconColor="text-blue-400"/>
                <StatCard label="Approved"      value={approved.length} loading={loading} icon={<CheckCircle size={22}/>} border="border-emerald-500/10" bg="bg-emerald-500/5" iconColor="text-emerald-400"/>
                <StatCard label="Pending"       value={pending.length}  loading={loading} icon={<Clock size={22}/>}       border="border-amber-500/10"   bg="bg-amber-500/5"   iconColor="text-amber-400"/>
                <StatCard label="Rejected"      value={rejected}        loading={loading} icon={<XCircle size={22}/>}     border="border-red-500/10"     bg="bg-red-500/5"     iconColor="text-red-400"/>
                <StatCard label="Total Users"   value={userCount}       loading={loading} icon={<Users size={22}/>}       border="border-indigo-500/10"  bg="bg-indigo-500/5"  iconColor="text-indigo-400"/>
            </div>

            {/* Pending alert */}
            {pending.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
                    <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-300 flex-1">
                        <span className="font-semibold">{pending.length} event{pending.length > 1 ? "s" : ""}</span> awaiting your approval — review them before their scheduled dates.
                    </p>
                </div>
            )}

            {/* Pending queue */}
            {pending.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-500/10 p-2"><Clock className="h-5 w-5 text-amber-400" /></div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Approve or reject inline — or view all in Event Management</p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/event-approval")} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white">
                            See all pending <ArrowRight size={13} />
                        </button>
                    </div>

                    <div className="divide-y divide-white/5">
                        {pending.slice(0, 5).map(e => {
                            const conflictsWith = wouldConflict(e, approved);
                            const hasConflict   = conflictsWith.length > 0;
                            const isRejecting   = rejectingId === e.event_id;
                            return (
                                <div key={e.event_id} className="px-6 py-4 hover:bg-white/[0.02] transition">
                                    {hasConflict && (
                                        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5">
                                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
                                            <p className="text-xs text-red-300">
                                                <span className="font-semibold">Conflict:</span> Approving this will overlap with{" "}
                                                <span className="font-medium">{conflictsWith.map((c: any) => `"${c.activity_title}"`).join(", ")}</span>{" "}
                                                at <span className="font-medium">{e.venue?.venue_name}</span> on the same date and time.
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <p className="text-xs text-gray-500 uppercase">{MONTH_NAMES[new Date(e.date).getMonth()]?.slice(0, 3)}</p>
                                            <p className="text-xl font-bold text-white leading-none">{new Date(e.date + "T00:00:00").getDate()}</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{e.activity_title}</p>
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</span>
                                                {e.venue?.venue_name && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} className="text-emerald-400" />{e.venue.venue_name}</span>}
                                                {e.department?.department_name && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10} className="text-purple-400" />{e.department.department_name}</span>}
                                                {e.requested_by && <span className="text-xs text-gray-400 flex items-center gap-1"><User size={10} className="text-amber-400" />{e.requested_by}</span>}
                                            </div>
                                        </div>
                                        {!isRejecting && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button disabled={actionLoading} onClick={() => handleApprove(e.event_id, e.activity_title)}
                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-50
                                                        ${hasConflict ? "border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20" : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}>
                                                    <CheckCircle size={13} />{hasConflict ? "Approve anyway" : "Approve"}
                                                </button>
                                                <button disabled={actionLoading} onClick={() => { setRejectingId(e.event_id); setRejectionReason(""); }}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
                                                    <XCircle size={13} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {isRejecting && (
                                        <div className="mt-3 space-y-2 pl-16">
                                            <textarea value={rejectionReason} onChange={ev => setRejectionReason(ev.target.value)}
                                                placeholder="Enter rejection reason (required)..." rows={2}
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-red-500 resize-none" />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleReject(e.event_id, e.activity_title)} disabled={actionLoading || !rejectionReason.trim()}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-40">
                                                    <XCircle size={13} />{actionLoading ? "Rejecting..." : "Confirm Reject"}
                                                </button>
                                                <button onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                                                    className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-white transition">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {pending.length > 5 && (
                        <button onClick={() => navigate("/event-approval")}
                            className="w-full border-t border-white/10 px-6 py-3 text-center text-xs text-gray-500 hover:text-blue-400 hover:bg-white/[0.02] transition flex items-center justify-center gap-1.5">
                            +{pending.length - 5} more pending — click to view all <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            )}

            {/* Calendar + side panel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-2"><CalendarDays className="h-5 w-5 text-blue-400" /></div>
                                <div>
                                    <h2 className="text-sm font-semibold text-white">
                                        {calView === "week" ? `${weekStart} – ${weekEnd}` : `${MONTH_NAMES[calMonth]} ${calYear}`}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">All approved events</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-xl border border-white/10 overflow-hidden">
                                    {(["day", "week", "month"] as const).map(v => (
                                        <button key={v} onClick={() => setCalView(v)}
                                            className={`px-3 py-1.5 text-xs font-medium capitalize transition ${calView === v ? "bg-blue-600 text-white" : "bg-black/20 text-gray-400 hover:text-white hover:bg-white/5"}`}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                {calView === "week" ? (
                                    <>
                                        <button onClick={handlePrevWeek} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white hover:bg-white/10 transition"><ChevronLeft size={16} /></button>
                                        <button onClick={handleNextWeek} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white hover:bg-white/10 transition"><ChevronRight size={16} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handlePrevMonth} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white hover:bg-white/10 transition"><ChevronLeft size={16} /></button>
                                        <button onClick={handleNextMonth} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white hover:bg-white/10 transition"><ChevronRight size={16} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Filter size={13} className="text-gray-500" />
                            <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900">
                                <option value="">All Venues</option>
                                {venueOptions.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900">
                                <option value="">All Departments</option>
                                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {(filterVenue || filterDept) && (
                                <button onClick={() => { setFilterVenue(""); setFilterDept(""); }} className="text-xs text-gray-500 hover:text-red-400 transition">Clear</button>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        {calView === "month" && (
                            <>
                                <div className="grid grid-cols-7 mb-2">
                                    {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr    = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
                                        const hasEvents  = !!approvedByDate[dateStr];
                                        const isConflict = conflictDates.has(dateStr);
                                        const isToday    = dateStr === todayStr;
                                        const isSelected = dateStr === selected;
                                        return (
                                            <button key={day} onClick={() => setSelected(isSelected ? null : dateStr)}
                                                className={`aspect-square rounded-xl text-sm font-medium transition flex flex-col items-center justify-center border
                                                    ${isSelected ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                    : isToday    ? "bg-white/10 border-white/20 text-white"
                                                    : isConflict ? "bg-red-500/10 border-red-500/30 text-white hover:bg-red-500/20"
                                                    : hasEvents  ? "bg-slate-800/80 border-emerald-500/20 text-white hover:bg-slate-700/80"
                                                    :               "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"}`}>
                                                {day}
                                                {hasEvents && !isSelected && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isConflict ? "bg-red-400" : "bg-emerald-400"}`} />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/30 inline-block" /> Today</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Events</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Conflict</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Selected</span>
                                </div>
                            </>
                        )}
                        {calView === "week" && (
                            <div className="grid grid-cols-7 gap-1">
                                {weekDates.map(dateStr => {
                                    const evs = approvedByDate[dateStr] ?? [];
                                    const isToday = dateStr === todayStr;
                                    const isSelected = dateStr === selected;
                                    const day = parseInt(dateStr.split("-")[2]);
                                    const dow = new Date(dateStr + "T00:00:00").getDay();
                                    return (
                                        <button key={dateStr} onClick={() => setSelected(isSelected ? null : dateStr)}
                                            className={`rounded-xl p-2 text-center border transition min-h-[80px] flex flex-col gap-1
                                                ${isSelected ? "bg-blue-600/20 border-blue-500/40" : isToday ? "bg-white/10 border-white/20" : "border-white/5 hover:bg-white/5"}`}>
                                            <span className="text-xs text-gray-500">{DAY_NAMES[dow]}</span>
                                            <span className={`text-sm font-bold ${isToday ? "text-white" : "text-gray-300"}`}>{day}</span>
                                            {evs.slice(0, 2).map((ev: any) => (
                                                <span key={ev.event_id + "-" + ev.date} className="block truncate rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] text-emerald-300">{ev.activity_title}</span>
                                            ))}
                                            {evs.length > 2 && <span className="text-[10px] text-gray-500">+{evs.length - 2} more</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {calView === "day" && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 font-medium">
                                    {dayViewDate === todayStr ? "Today" : dayViewDate}
                                    {filterVenue && ` · ${filterVenue}`}{filterDept && ` · ${filterDept}`}
                                </p>
                                {dayViewEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm gap-2">
                                        <CalendarDays size={24} className="text-gray-600" />No approved events on this date
                                    </div>
                                ) : (
                                    dayViewEvents.map((e: any) => (
                                        <div key={e.event_id + "-" + e.date} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4">
                                            <p className="text-sm font-medium text-white mb-2">{e.activity_title}</p>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                                {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400" />{e.venue.venue_name}</p>}
                                                {e.department?.department_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Building2 size={11} className="text-purple-400" />{e.department.department_name}</p>}
                                                {e.requested_by && <p className="text-xs text-gray-400 flex items-center gap-1.5"><User size={11} className="text-amber-400" />{e.requested_by}</p>}
                                                {e._totalDays > 1 && <p className="text-xs text-gray-400 flex items-center gap-1.5"><CalendarDays size={11} className="text-gray-500" />Day {e._dayIndex} of {e._totalDays}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side panel */}
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl flex flex-col">
                    <div className="border-b border-white/10 px-5 py-4">
                        <h3 className="text-sm font-semibold text-white">{selected ? `Events on ${selected}` : "Select a date"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selected ? (selectedEvents.length === 0 ? "No approved events" : `${selectedEvents.length} approved event(s)`) : "Click any date to view events"}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {!selected ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm text-center gap-2">
                                <CalendarDays size={28} className="text-gray-600" />Click any date to view approved events
                            </div>
                        ) : selectedEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm text-center gap-2">
                                <XCircle size={28} className="text-gray-600" />No approved events on this date
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedEvents.map((e: any) => (
                                    <div key={e.event_id + "-" + e.date} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 hover:bg-slate-800/90 hover:border-blue-500/20 transition group">
                                        <p className="text-sm font-medium text-white group-hover:text-blue-300 transition mb-2">{e.activity_title}</p>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400 flex-shrink-0" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                            {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400 flex-shrink-0" />{e.venue.venue_name}</p>}
                                            {e.department?.department_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Building2 size={11} className="text-purple-400 flex-shrink-0" />{e.department.department_name}</p>}
                                            {e.requested_by && <p className="text-xs text-gray-400 flex items-center gap-1.5"><User size={11} className="text-amber-400 flex-shrink-0" />{e.requested_by}</p>}
                                            {e._totalDays > 1 && <p className="text-xs text-gray-400 flex items-center gap-1.5"><CalendarDays size={11} className="text-gray-500 flex-shrink-0" />Day {e._dayIndex} of {e._totalDays}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-red-500/20 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-red-500/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-red-500/10 p-2"><AlertCircle className="h-5 w-5 text-red-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Venue Conflicts Detected</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{conflicts.length} venue/time overlap{conflicts.length > 1 ? "s" : ""} among approved events</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {conflicts.map((c, idx) => (
                            <div key={idx} className="flex items-start gap-4 px-6 py-4">
                                <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-red-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{c.date} — {c.venue}</p>
                                    <div className="mt-1 space-y-0.5">
                                        {c.events.map((ev: any) => <p key={ev.event_id} className="text-xs text-gray-400">· {ev.activity_title} ({formatTime(ev.time_start)} – {formatTime(ev.time_end)})</p>)}
                                    </div>
                                </div>
                                <span className="flex-shrink-0 text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded-full px-3 py-1">Conflict</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's events */}
            {todayEvents.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-500/10 p-2"><CalendarDays className="h-5 w-5 text-cyan-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Today's Events</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{todayEvents.length} event(s) scheduled today</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {todayEvents.map((e: any) => (
                            <div key={e.event_id + "-" + e.date} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{e.activity_title}</p>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</span>
                                        {e.venue?.venue_name && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} className="text-emerald-400" />{e.venue.venue_name}</span>}
                                        {e.department?.department_name && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10} className="text-purple-400" />{e.department.department_name}</span>}
                                        {e._totalDays > 1 && <span className="text-xs text-gray-400">Day {e._dayIndex} of {e._totalDays}</span>}
                                    </div>
                                </div>
                                <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"><CheckCircle size={11} /> Approved</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2"><CalendarDays className="h-5 w-5 text-emerald-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Upcoming Approved Events</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Next {upcomingEvents.length} event(s) from today</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {upcomingEvents.map((e: any) => (
                            <div key={e.event_id + "-" + e.date} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition">
                                <div className="flex-shrink-0 w-12 text-center">
                                    <p className="text-xs text-gray-500 uppercase">{MONTH_NAMES[new Date(e.date).getMonth()]?.slice(0, 3)}</p>
                                    <p className="text-xl font-bold text-white leading-none">{new Date(e.date + "T00:00:00").getDate()}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{e.activity_title}</p>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</span>
                                        {e.venue?.venue_name && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} className="text-emerald-400" />{e.venue.venue_name}</span>}
                                        {e.department?.department_name && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10} className="text-purple-400" />{e.department.department_name}</span>}
                                        {e._totalDays > 1 && <span className="text-xs text-gray-400">Day {e._dayIndex} of {e._totalDays}</span>}
                                    </div>
                                </div>
                                <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"><CheckCircle size={11} /> Approved</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;