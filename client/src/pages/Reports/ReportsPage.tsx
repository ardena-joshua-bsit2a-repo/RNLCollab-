import { useState } from "react"
import {
    CalendarDays,
    Users,
    BarChart3,
    Activity,
    FileText,
    Database,
    FileBarChart,
    Clock3,
} from "lucide-react"

import EventsReport from "./components/EventsReport"
import UsersReport from "./components/UsersReport"
import BookingSummaryReport from "./components/BookingSummaryReport"
import ActivityLogReport from "./components/ActivityLogReport"

const TABS = [
    {
        key: "events",
        label: "Events",
        icon: CalendarDays,
        color: "from-blue-500 to-cyan-500",
    },
    {
        key: "users",
        label: "Users",
        icon: Users,
        color: "from-emerald-500 to-green-500",
    },
    {
        key: "summary",
        label: "Booking Summary",
        icon: BarChart3,
        color: "from-purple-500 to-pink-500",
    },
    {
        key: "activity",
        label: "Activity Logs",
        icon: Activity,
        color: "from-orange-500 to-red-500",
    },
]

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState("events")

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F] p-6 text-white">

            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0">

                <div className="absolute top-0 left-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />

                <div className="absolute right-0 bottom-0 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-3xl" />

                <div
                    className="
                        absolute inset-0
                        bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),
                        linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
                        bg-[size:40px_40px]
                    "
                />
            </div>

            <div className="relative z-10 space-y-8">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)]">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />

                    <div className="relative z-10">

                        <div className="flex items-center gap-4">

                            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                                <FileText
                                    size={32}
                                    className="text-white"
                                />
                            </div>

                            <div>
                                <h1 className="text-4xl font-bold tracking-tight">
                                    Reports & Analytics
                                </h1>

                                <p className="mt-3 max-w-3xl text-blue-100">
                                    Monitor event bookings, user activity,
                                    venue utilization, and overall system
                                    performance through comprehensive reports
                                    and real-time analytics.
                                </p>
                            </div>

                        </div>

                        {/* Report Info Cards */}
                        <div className="mt-6 flex flex-wrap gap-4">

                            <div
                                className="
                                    flex items-center gap-3
                                    rounded-2xl border border-white/10
                                    bg-white/5 px-4 py-3
                                    backdrop-blur-xl
                                    transition-all duration-300
                                    hover:bg-white/10
                                "
                            >
                                <div className="rounded-lg bg-blue-500/20 p-2">
                                    <FileBarChart
                                        size={18}
                                        className="text-blue-400"
                                    />
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400">
                                        Available Reports
                                    </span>

                                    <p className="font-semibold text-white">
                                        4 Modules
                                    </p>
                                </div>
                            </div>

                            <div
                                className="
                                    flex items-center gap-3
                                    rounded-2xl border border-white/10
                                    bg-white/5 px-4 py-3
                                    backdrop-blur-xl
                                    transition-all duration-300
                                    hover:bg-white/10
                                "
                            >
                                <div className="rounded-lg bg-emerald-500/20 p-2">
                                    <Database
                                        size={18}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400">
                                        Data Source
                                    </span>

                                    <p className="font-semibold text-emerald-400">
                                        Live Database
                                    </p>
                                </div>
                            </div>

                            <div
                                className="
                                    flex items-center gap-3
                                    rounded-2xl border border-white/10
                                    bg-white/5 px-4 py-3
                                    backdrop-blur-xl
                                    transition-all duration-300
                                    hover:bg-white/10
                                "
                            >
                                <div className="rounded-lg bg-purple-500/20 p-2">
                                    <Clock3
                                        size={18}
                                        className="text-purple-400"
                                    />
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400">
                                        Generated
                                    </span>

                                    <p className="font-semibold text-white">
                                        Real-Time
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Tabs */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-2xl">

                    <div className="flex flex-wrap gap-3">

                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            const active = activeTab === tab.key

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        flex items-center gap-3
                                        rounded-2xl px-6 py-3
                                        font-medium
                                        transition-all duration-300

                                        ${
                                            active
                                                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                                                : "bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        className={`transition-transform ${
                                            active
                                                ? "rotate-6"
                                                : "group-hover:rotate-6"
                                        }`}
                                    />

                                    {tab.label}
                                </button>
                            )
                        })}

                    </div>

                </div>

                {/* Report Content */}
                <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_10px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl">

                    <div className="animate-in fade-in duration-300">

                        {activeTab === "events" && (
                            <EventsReport />
                        )}

                        {activeTab === "users" && (
                            <UsersReport />
                        )}

                        {activeTab === "summary" && (
                            <BookingSummaryReport />
                        )}

                        {activeTab === "activity" && (
                            <ActivityLogReport />
                        )}

                    </div>

                </div>

            </div>

        </div>
    )
}

export default ReportsPage