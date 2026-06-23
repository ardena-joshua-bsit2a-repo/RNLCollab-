import { useEffect, useRef, useState, type JSX } from "react"
import { useNavigate } from "react-router-dom"
import { FiBell, FiCheck, FiCalendar, FiX } from "react-icons/fi"
import NotificationService from "../../../services/NotificationService"

interface Notification {
    notification_id: number
    type: string
    title: string
    message: string
    event_id: number | null
    is_read: boolean
    created_at: string
}

const iconMap: Record<string, JSX.Element> = {
    new_booking: <FiCalendar size={14} className="text-indigo-400" />,
    approved:    <FiCheck    size={14} className="text-green-400" />,
    rejected:    <FiX       size={14} className="text-red-400" />,
}

const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const getNotificationRoute = (type: string, eventId: number | null, isSuperAdmin: boolean): string => {
    if (!eventId) return "#"

    switch (type) {
        case "new_booking":
        case "approved":
        case "rejected":
            return isSuperAdmin
                ? `/event-approval?event_id=${eventId}`
                : `/events`
        default:
            return isSuperAdmin ? "/event-approval" : "/events"
    }
}

interface NotificationBellProps {
    isSuperAdmin: boolean
}

const NotificationBell = ({ isSuperAdmin }: NotificationBellProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount]     = useState(0)
    const [isOpen, setIsOpen]               = useState(false)
    const ref      = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const fetchNotifications = async () => {
        try {
            const res = await NotificationService.getNotifications()
            setNotifications(res.data.notifications)
            setUnreadCount(res.data.unread_count)
        } catch {}
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleMarkAsRead = async (id: number) => {
        await NotificationService.markAsRead(id)
        setNotifications(prev =>
            prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllAsRead = async () => {
        await NotificationService.markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const handleNotificationClick = async (n: Notification) => {
        if (!n.is_read) {
            await handleMarkAsRead(n.notification_id)
        }
        const route = getNotificationRoute(n.type, n.event_id, isSuperAdmin)
        setIsOpen(false)
        navigate(route)
    }

    return (
        <div className="relative z-50" ref={ref}>
            <button
                onClick={() => setIsOpen(o => !o)}
                className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
                <FiBell size={19} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[52px] w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.notification_id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`
                                        flex gap-3 px-4 py-3 transition cursor-pointer
                                        hover:bg-slate-700
                                        ${!n.is_read ? "bg-slate-800/50" : ""}
                                    `}
                                >
                                    <div className="mt-0.5 h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                        {iconMap[n.type] ?? <FiBell size={14} className="text-slate-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white leading-none mb-1">{n.title}</p>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                                    </div>
                                    {!n.is_read && (
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell