import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import EventService from "../../../services/EventService";
import type { EventColumns } from "../../../interfaces/EventInterface";
import { useAuth } from "../../../contexts/AuthContext";
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    FileText,
    Download,
    CalendarDays,
    CheckCircle,
    XCircle,
    Clock3,
    RotateCcw,
} from "lucide-react";

interface ViewEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventColumns | null;
    onActioned?: (message: string) => void;
    refreshKey?: () => void;
}

const ViewEventModal: FC<ViewEventModalProps> = ({
    isOpen,
    onClose,
    event,
    onActioned,
    refreshKey,
}) => {
    const { isSuperAdmin } = useAuth();

    const [loading, setLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    if (!event) return null;

    const formatTime = (time: string) =>
        new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const handleAction = async (fn: () => Promise<any>) => {
        try {
            setLoading(true);
            const res = await fn();
            if (res.status === 200) {
                onActioned?.(res.data.message);
                refreshKey?.();
                setShowRejectForm(false);
                setRejectionReason("");
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = () => {
        switch (event.status) {
            case "approved":
                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-medium text-emerald-400">
                        <CheckCircle size={14} />
                        APPROVED
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-xs font-medium text-red-400">
                        <XCircle size={14} />
                        REJECTED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs font-medium text-amber-400">
                        <Clock3 size={14} />
                        PENDING
                    </span>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <div className="space-y-6">

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-cyan-500/10 p-3">
                            <CalendarDays className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Event Booking
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Complete information and booking details.
                            </p>
                            <div className="mt-3">
                                {statusBadge()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Title & Description */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400" />
                        <h3 className="font-semibold text-white">Activity Details</h3>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-6">
                            
                            {/* LEFT SIDE - Activity Title */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase">
                                    Activity Title
                                </p>
                                <p className="mt-1 font-medium text-white">
                                    {event.activity_title}
                                </p>
                            </div>

                            {/* RIGHT SIDE - Description */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase">
                                    Description
                                </p>
                                <p className="mt-1 font-medium text-white">
                                    {event.activity_description || "—"}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Schedule & Venue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-400" />
                            <h3 className="font-semibold text-white">Schedule</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Date</p>
                                <p className="mt-1 font-medium text-white">{event.date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Duration</p>
                                <p className="mt-1 font-medium text-white">{event.number_of_days} day(s)</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Time</p>
                                <p className="mt-1 font-medium text-white">
                                    {formatTime(event.time_start)} – {formatTime(event.time_end)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-emerald-400" />
                            <h3 className="font-semibold text-white">Venue</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Location</p>
                                <p className="mt-1 font-medium text-white">{event.venue?.venue_name ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Department</p>
                                <p className="mt-1 font-medium text-white">{event.department?.department_name ?? "—"}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Person in Charge */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <User size={18} className="text-amber-400" />
                        <h3 className="font-semibold text-white">Person in Charge</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Requested By</p>
                            <p className="mt-1 font-medium text-white">{event.requested_by}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Email</p>
                            <p className="mt-1 font-medium text-white">{event.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Telephone</p>
                            <p className="mt-1 font-medium text-white">{event.telephone_number ?? "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Rejection Reason */}
                {event.status === "rejected" && event.rejection_reason && (
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <XCircle size={18} className="text-red-400" />
                            <h3 className="font-semibold text-red-400">Reason for Rejection</h3>
                        </div>
                        <p className="text-red-200 text-sm">{event.rejection_reason}</p>
                    </div>
                )}

                {/* Admin Actions */}
                {isSuperAdmin && (
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2 size={18} className="text-purple-400" />
                            <h3 className="font-semibold text-white">Administrative Actions</h3>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {event.status === "pending" && (
                                <>
                                    <button
                                        onClick={() =>
                                            handleAction(() => EventService.approveEvent(event.event_id))
                                        }
                                        disabled={loading}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={loading}
                                        className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </>
                            )}

                            {event.status !== "pending" && (
                                <button
                                    onClick={() =>
                                        handleAction(() => EventService.revertEvent(event.event_id))
                                    }
                                    disabled={loading}
                                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
                                >
                                    <RotateCcw size={16} />
                                    Revert to Pending
                                </button>
                            )}
                        </div>

                        {showRejectForm && (
                            <div className="mt-4 space-y-3">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none focus:border-red-500 resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            handleAction(() =>
                                                EventService.rejectEvent(event.event_id, rejectionReason)
                                            )
                                        }
                                        disabled={loading}
                                        className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        Confirm Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectForm(false)}
                                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                    <CloseButton label="Close" onClose={onClose} />
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25"
                    >
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default ViewEventModal;