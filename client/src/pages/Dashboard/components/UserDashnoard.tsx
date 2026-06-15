import { useEffect, useState } from "react";
import {
    CalendarDays, CheckCircle, XCircle, Clock, LayoutDashboard,
    ChevronLeft, ChevronRight, MapPin, Building2, User, Layers,
    History, Info, Filter,
} from "lucide-react";
import { getUserDisplayName, useAuth } from "../../../contexts/AuthContext";
import EventService from "../../../services/EventService";

const getDaysInMonth     = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const formatTime = (t: string) => new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface StatCardProps { label: string; value: number | string; icon: React.ReactNode; border: string; bg: string; iconColor: string; loading: boolean; }
const StatCard = ({ label, value, icon, border, bg, iconColor, loading }: StatCardProps) => (
    <div className={`rounded-3xl border ${border} ${bg} p-5`}>
        <p className="text-sm text-gray-400">{label}</p>
        <div className="mt-3 flex items-center gap-3">
            <span className={iconColor}>{icon}</span>
            <span className="text-3xl font-bold text-white">{loading ? <span className="text-gray-500 text-xl">—</span> : value}</span>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
        approved: { cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400", icon: <CheckCircle size={11} />, label: "Approved" },
        pending:  { cls: "border-amber-500/20 bg-amber-500/10 text-amber-400",       icon: <Clock size={11} />,       label: "Pending"  },
        rejected: { cls: "border-red-500/20 bg-red-500/10 text-red-400",             icon: <XCircle size={11} />,    label: "Rejected" },
    };
    const s = map[status] ?? { cls: "border-white/10 bg-white/5 text-gray-400", icon: null, label: status };
    return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium flex-shrink-0 ${s.cls}`}>{s.icon}{s.label}</span>;
};

const UserDashboard = () => {
    const { user } = useAuth();
    const [myEvents,    setMyEvents]    = useState<any[]>([]);
    const [allApproved, setAllApproved] = useState<any[]>([]);
    const [loading,     setLoading]     = useState(true);

    const today = new Date();
    const [calYear,    setCalYear]    = useState(today.getFullYear());
    const [calMonth,   setCalMonth]   = useState(today.getMonth());
    const [selected,   setSelected]   = useState<string | null>(null);
    const [calView,    setCalView]    = useState<"month" | "week" | "day">("month");
    const [weekAnchor, setWeekAnchor] = useState<Date>(() => { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d; });
    const [filterVenue, setFilterVenue] = useState("");
    const [filterDept,  setFilterDept]  = useState("");

    const handlePrevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
    const handleNextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };
    const handlePrevWeek  = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
    const handleNextWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };

    useEffect(() => {
        const load = async () => {
            try {
                const [myRes, allRes] = await Promise.all([
                    EventService.loadUserEvents(),
                    EventService.loadAllEventsForReport(),
                ]);
                // 👇 expand multi-day events for both
                if (myRes.status === 200) {
                    setMyEvents(expandMultiDayEvents(myRes.data.events));
                }
                if (allRes.status === 200) {
                    setAllApproved(expandMultiDayEvents(
                        allRes.data.events.filter((e: any) => e.status === "approved")
                    ));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const todayStr   = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const myApproved = myEvents.filter(e => e.status === "approved");
    const myPending  = myEvents.filter(e => e.status === "pending");
    const myRejected = myEvents.filter(e => e.status === "rejected").length;
    const myUpcoming = myApproved.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const myPast     = myEvents.filter(e => e.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));

    // ── Filter helper: applies venue + dept to ANY event array ────────────────
    const applyFilter = (events: any[]) => events.filter(e => {
        const matchVenue = !filterVenue || e.venue?.venue_name === filterVenue;
        const matchDept  = !filterDept  || e.department?.department_name === filterDept;
        return matchVenue && matchDept;
    });

    // ── Filtered approved events (all users) — drives calendar green dots ─────
    const filteredApproved = applyFilter(allApproved);

    // ── Filtered MY events — drives calendar orange dots + side panel ─────────
    // When a filter is active, only show my events that match that venue/dept.
    // When no filter, show all my events.
    const filteredMyEvents = applyFilter(myEvents);

    // ── Calendar lookup maps (both respect the same filter) ───────────────────
    const approvedByDate: Record<string, any[]> = {};
    filteredApproved.forEach(e => {
        if (!approvedByDate[e.date]) approvedByDate[e.date] = [];
        approvedByDate[e.date].push(e);
    });

    const myEventsByDate: Record<string, any[]> = {};
    filteredMyEvents.forEach(e => {
        if (!myEventsByDate[e.date]) myEventsByDate[e.date] = [];
        myEventsByDate[e.date].push(e);
    });

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
                    _originalDate: event.date,  // keep original for reference
                    _dayIndex: i + 1,
                    _totalDays: days,
                });
            }
        });
        return expanded;
    };

    // ── Filter options derived from full approved list ─────────────────────────
    const venueOptions = [...new Set(allApproved.map(e => e.venue?.venue_name).filter(Boolean))];
    const deptOptions  = [...new Set(allApproved.map(e => e.department?.department_name).filter(Boolean))];

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay    = getFirstDayOfMonth(calYear, calMonth);

    // ── Side panel: uses filtered maps so panel respects active filter ─────────
    const selectedAllEvents  = selected ? (approvedByDate[selected] ?? []) : [];
    const selectedMyEvents   = selected ? (myEventsByDate[selected]  ?? []) : [];
    const selectedDateBusy   = selectedAllEvents.length > 0;
    const selectedHasMyEvent = selectedMyEvents.length > 0;

    // ── Today's events — also filtered ────────────────────────────────────────
    const allTodayEvents = filteredApproved.filter(e => e.date === todayStr);

    // ── Week view ─────────────────────────────────────────────────────────────
    const getWeekDates = (): string[] => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekAnchor); d.setDate(d.getDate() + i);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });
    const weekDates   = getWeekDates();
    const weekStart   = weekDates[0];
    const weekEnd     = weekDates[6];

    // ── Day view ──────────────────────────────────────────────────────────────
    const dayViewDate   = selected ?? todayStr;
    const dayViewEvents = approvedByDate[dayViewDate] ?? [];

    const hasFilter = !!(filterVenue || filterDept);

    return (
        <div className="space-y-6 text-slate-100">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-emerald-500/10 p-3"><LayoutDashboard className="h-6 w-6 text-emerald-400" /></div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-400">Welcome back, <span className="font-medium text-white">{getUserDisplayName(user)}</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"><User size={14} className="text-emerald-400" />{user?.role?.role_name ?? "—"}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"><Building2 size={14} className="text-teal-400" />{user?.department?.department_name ?? "—"}</span>
                    </div>
                </div>
            </div>

            {/* ── Stat cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="My Total"  value={myEvents.length}   loading={loading} icon={<Layers size={22}/>}      border="border-blue-500/10"    bg="bg-blue-500/5"    iconColor="text-blue-400"/>
                <StatCard label="Approved"  value={myApproved.length} loading={loading} icon={<CheckCircle size={22}/>} border="border-emerald-500/10" bg="bg-emerald-500/5" iconColor="text-emerald-400"/>
                <StatCard label="Pending"   value={myPending.length}  loading={loading} icon={<Clock size={22}/>}       border="border-amber-500/10"   bg="bg-amber-500/5"   iconColor="text-amber-400"/>
                <StatCard label="Rejected"  value={myRejected}        loading={loading} icon={<XCircle size={22}/>}     border="border-red-500/10"     bg="bg-red-500/5"     iconColor="text-red-400"/>
            </div>

            {/* ── Booking tip ──────────────────────────────────────────────── */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-400" />
                <p className="text-sm text-blue-300">
                    <span className="font-semibold">Booking tip:</span> Green dots = approved events. Orange dots = your bookings.
                    Use the venue and department filters — both dots and the side panel update together so you see exactly what's booked at that venue.
                </p>
            </div>

            {/* ── Active filter indicator ───────────────────────────────────── */}
            {hasFilter && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                    <Filter size={14} className="text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-300 flex-1">
                        Showing events filtered by{" "}
                        {filterVenue && <span className="font-medium text-white">venue: {filterVenue}</span>}
                        {filterVenue && filterDept && " and "}
                        {filterDept  && <span className="font-medium text-white">department: {filterDept}</span>}
                        {" "}— calendar, side panel, and today's events all reflect this filter.
                    </p>
                    <button
                        onClick={() => { setFilterVenue(""); setFilterDept(""); }}
                        className="text-xs text-gray-500 hover:text-red-400 transition flex-shrink-0"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {/* ── Today's Events ───────────────────────────────────────────── */}
            {!loading && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-500/10 p-2"><CalendarDays className="h-5 w-5 text-cyan-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Today's Events</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {allTodayEvents.length === 0
                                    ? hasFilter ? "No events match your filter today" : "No approved events scheduled today"
                                    : `${allTodayEvents.length} approved event(s) today${hasFilter ? " (filtered)" : ""}`}
                            </p>
                        </div>
                    </div>
                    {allTodayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm gap-2">
                            <CheckCircle size={28} className="text-emerald-600" />
                            <p className="font-medium text-white">All clear today</p>
                            <p className="text-xs">{hasFilter ? "No events match your current filter." : "No events are scheduled — great day to submit a booking!"}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {allTodayEvents.map((e: any) => {
                                const isMyEvent = myEvents.some(m => m.event_id === e.event_id);
                                return (
                                    <div key={e.event_id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-medium text-white truncate">{e.activity_title}</p>
                                                {isMyEvent && (
                                                    <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 flex-shrink-0">My booking</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</span>
                                                {e.venue?.venue_name && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} className="text-emerald-400" />{e.venue.venue_name}</span>}
                                                {e.department?.department_name && <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10} className="text-purple-400" />{e.department.department_name}</span>}
                                            </div>
                                        </div>
                                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"><CheckCircle size={11} /> Approved</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Calendar + side panel ────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">

                    {/* Calendar header + view toggle + filters */}
                    <div className="border-b border-white/10 px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-2"><CalendarDays className="h-5 w-5 text-emerald-400" /></div>
                                <div>
                                    <h2 className="text-sm font-semibold text-white">
                                        {calView === "week" ? `${weekStart} – ${weekEnd}` : `${MONTH_NAMES[calMonth]} ${calYear}`}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {hasFilter ? "Filtered view — click a date for details" : "All approved events — click a date for details"}
                                    </p>
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

                        {/* Venue + Department filters */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <Filter size={13} className="text-gray-500" />
                            <select value={filterVenue} onChange={e => { setFilterVenue(e.target.value); setSelected(null); }}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900">
                                <option value="">All Venues</option>
                                {venueOptions.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setSelected(null); }}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 [&>option]:bg-gray-900">
                                <option value="">All Departments</option>
                                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {hasFilter && (
                                <button
                                    onClick={() => { setFilterVenue(""); setFilterDept(""); setSelected(null); }}
                                    className="text-xs text-gray-500 hover:text-red-400 transition"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4">

                        {/* ── Month view ── */}
                        {calView === "month" && (
                            <>
                                <div className="grid grid-cols-7 mb-2">
                                    {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day        = i + 1;
                                        const dateStr    = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
                                        // Both checks now use filtered maps — dots only show if event matches the filter
                                        const isBusy     = !!approvedByDate[dateStr];
                                        const isMine     = !!myEventsByDate[dateStr];
                                        const isToday    = dateStr === todayStr;
                                        const isSelected = dateStr === selected;
                                        return (
                                            <button key={day} onClick={() => setSelected(isSelected ? null : dateStr)}
                                                className={`aspect-square rounded-xl text-sm font-medium transition flex flex-col items-center justify-center border
                                                    ${isSelected ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                    : isToday    ? "bg-white/10 border-white/20 text-white"
                                                    : isMine     ? "bg-amber-500/10 border-amber-500/30 text-white hover:bg-amber-500/20"
                                                    : isBusy     ? "bg-slate-800/80 border-emerald-500/20 text-white hover:bg-slate-700/80"
                                                    :               "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"}`}>
                                                {day}
                                                {!isSelected && isMine  && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />}
                                                {!isSelected && !isMine && isBusy && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/30 inline-block" /> Today</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Approved events</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> My bookings</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Selected</span>
                                    {hasFilter && <span className="flex items-center gap-1.5 text-blue-400 font-medium">· Filtered view active</span>}
                                </div>
                            </>
                        )}

                        {/* ── Week view ── */}
                        {calView === "week" && (
                            <div className="grid grid-cols-7 gap-1">
                                {weekDates.map(dateStr => {
                                    const evs        = approvedByDate[dateStr] ?? [];   // filtered
                                    const isMine     = !!myEventsByDate[dateStr];        // filtered
                                    const isToday    = dateStr === todayStr;
                                    const isSelected = dateStr === selected;
                                    const day        = parseInt(dateStr.split("-")[2]);
                                    const dow        = new Date(dateStr + "T00:00:00").getDay();
                                    return (
                                        <button key={dateStr} onClick={() => setSelected(isSelected ? null : dateStr)}
                                            className={`rounded-xl p-2 text-center border transition min-h-[80px] flex flex-col gap-1
                                                ${isSelected ? "bg-blue-600/20 border-blue-500/40" : isToday ? "bg-white/10 border-white/20" : isMine ? "bg-amber-500/10 border-amber-500/30" : "border-white/5 hover:bg-white/5"}`}>
                                            <span className="text-xs text-gray-500">{DAY_NAMES[dow]}</span>
                                            <span className={`text-sm font-bold ${isToday ? "text-white" : "text-gray-300"}`}>{day}</span>
                                            {evs.slice(0, 2).map((ev: any) => (
                                                <span key={ev.event_id} className="block truncate rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] text-emerald-300">{ev.activity_title}</span>
                                            ))}
                                            {evs.length > 2 && <span className="text-[10px] text-gray-500">+{evs.length - 2} more</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Day view ── */}
                        {calView === "day" && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 font-medium">
                                    {dayViewDate === todayStr ? "Today" : dayViewDate}
                                    {filterVenue && ` · ${filterVenue}`}
                                    {filterDept  && ` · ${filterDept}`}
                                </p>
                                {dayViewEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm gap-2">
                                        <CalendarDays size={24} className="text-gray-600" />
                                        {hasFilter ? "No events match your filter on this date" : "No approved events on this date"}
                                    </div>
                                ) : (
                                    dayViewEvents.map((e: any) => {
                                        const isMyEvent = myEvents.some(m => m.event_id === e.event_id);
                                        return (
                                            <div key={e.event_id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <p className="text-sm font-medium text-white">{e.activity_title}</p>
                                                    {isMyEvent && (
                                                        <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 flex-shrink-0">My booking</span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                                    {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400" />{e.venue.venue_name}</p>}
                                                    {e.department?.department_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Building2 size={11} className="text-purple-400" />{e.department.department_name}</p>}
                                                    {e.requested_by && <p className="text-xs text-gray-400 flex items-center gap-1.5"><User size={11} className="text-amber-400" />{e.requested_by}</p>}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Side panel ── */}
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl flex flex-col">
                    <div className="border-b border-white/10 px-5 py-4">
                        <h3 className="text-sm font-semibold text-white">{selected ? selected : "Select a date"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {!selected          ? "Click any date to view details"
                            : selectedHasMyEvent ? `${selectedMyEvents.length} of your booking(s)${hasFilter ? " matching filter" : ""}`
                            : selectedDateBusy   ? `Venue busy${hasFilter ? " (filtered)" : ""} — other approved events`
                            :                      hasFilter ? "No events match your filter on this date" : "No events — free to book!"}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {!selected ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm text-center gap-2">
                                <CalendarDays size={28} className="text-gray-600" />Click any date to view details
                            </div>

                        ) : selectedHasMyEvent ? (
                            // My events on this date (filtered)
                            <div className="space-y-3">
                                {selectedMyEvents.map((e: any) => (
                                    <div key={e.event_id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 hover:bg-slate-800/90 transition">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="text-sm font-medium text-white">{e.activity_title}</p>
                                            <StatusBadge status={e.status} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400 flex-shrink-0" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                            {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400 flex-shrink-0" />{e.venue.venue_name}</p>}
                                            {e.department?.department_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Building2 size={11} className="text-purple-400 flex-shrink-0" />{e.department.department_name}</p>}
                                        </div>
                                    </div>
                                ))}
                                {/* Other approved events on the same date that are NOT mine (also filtered) */}
                                {selectedAllEvents.filter((e: any) => !selectedMyEvents.find((m: any) => m.event_id === e.event_id)).length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-2 uppercase font-medium tracking-wide">Other approved events</p>
                                        {selectedAllEvents
                                            .filter((e: any) => !selectedMyEvents.find((m: any) => m.event_id === e.event_id))
                                            .map((e: any) => (
                                                <div key={e.event_id} className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3 mb-2">
                                                    <p className="text-sm font-medium text-white mb-1">{e.activity_title}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                                        {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400" />{e.venue.venue_name}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                        ) : selectedDateBusy ? (
                            // Date is busy — show all filtered approved events
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                    <p className="text-sm font-medium text-amber-300 mb-1">Venue busy</p>
                                    <p className="text-xs text-amber-400/80">
                                        {hasFilter
                                            ? `Approved events for ${[filterVenue, filterDept].filter(Boolean).join(" / ")} on this date.`
                                            : "Approved events are scheduled on this date. Consider choosing a different date or confirming venue availability."}
                                    </p>
                                </div>
                                {selectedAllEvents.map((e: any) => (
                                    <div key={e.event_id} className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                                        <p className="text-sm font-medium text-white mb-1">{e.activity_title}</p>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={11} className="text-blue-400" />{formatTime(e.time_start)} – {formatTime(e.time_end)}</p>
                                            {e.venue?.venue_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400" />{e.venue.venue_name}</p>}
                                            {e.department?.department_name && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Building2 size={11} className="text-purple-400" />{e.department.department_name}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        ) : (
                            // Date is free (under this filter)
                            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                                <CheckCircle size={28} className="text-emerald-500" />
                                <p className="text-sm font-medium text-white">
                                    {hasFilter ? "No events at this venue / department" : "Free to book"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {hasFilter
                                        ? "This date looks available for the selected filter. Confirm before booking."
                                        : "No events on this date — good availability."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Pending ───────────────────────────────────────────────────── */}
            {myPending.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500/10 p-2"><Clock className="h-5 w-5 text-amber-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Awaiting Approval</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{myPending.length} request{myPending.length > 1 ? "s" : ""} pending review</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {myPending.map(e => (
                            <div key={e.event_id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition">
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
                                    </div>
                                </div>
                                <StatusBadge status="pending" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Upcoming approved ─────────────────────────────────────────── */}
            {myUpcoming.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2"><CalendarDays className="h-5 w-5 text-emerald-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">My Upcoming Approved Bookings</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{myUpcoming.length} confirmed event{myUpcoming.length > 1 ? "s" : ""} from today</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {myUpcoming.map(e => (
                            <div key={e.event_id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition">
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
                                    </div>
                                </div>
                                <StatusBadge status="approved" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Past bookings ─────────────────────────────────────────────── */}
            {myPast.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <div className="rounded-xl bg-slate-700/50 p-2"><History className="h-5 w-5 text-gray-400" /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Past Bookings</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Your booking history</p>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {myPast.map(e => (
                            <div key={e.event_id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition opacity-80">
                                <div className="flex-shrink-0 w-12 text-center">
                                    <p className="text-xs text-gray-500 uppercase">{MONTH_NAMES[new Date(e.date).getMonth()]?.slice(0, 3)}</p>
                                    <p className="text-xl font-bold text-gray-400 leading-none">{new Date(e.date + "T00:00:00").getDate()}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-300 truncate">{e.activity_title}</p>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{formatTime(e.time_start)} – {formatTime(e.time_end)}</span>
                                        {e.venue?.venue_name && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{e.venue.venue_name}</span>}
                                    </div>
                                </div>
                                <StatusBadge status={e.status} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {!loading && myEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/50 py-16 text-center">
                    <CalendarDays size={40} className="text-gray-600 mb-4" />
                    <p className="text-base font-medium text-white mb-1">No bookings yet</p>
                    <p className="text-sm text-gray-500">Use the calendar above to find a free date, then submit a booking request.</p>
                </div>
            )}

        </div>
    );
};

export default UserDashboard;