import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import EventService from "../../../services/EventService";
import type { EventColumns } from "../../../interfaces/EventInterface";
import {
    Calendar,
    Clock3,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    CalendarDays,
    User,
    Shield,
} from "lucide-react";

interface AdminEventReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventColumns | null;
    onReviewed: (message: string) => void;
    refreshKey: () => void;
}

const AdminEventReviewModal: FC<AdminEventReviewModalProps> = ({
    isOpen,
    onClose,
    event,
    onReviewed,
    refreshKey,
}) => {
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleApprove = async () => {
        if (!event) return;
        try {
            setLoading(true);
            const res = await EventService.approveEvent(event.event_id);
            if (res.status === 200) {
                onReviewed(res.data.message);
                refreshKey();
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!event) return;

        if (!rejectionReason.trim()) {
            setError("Rejection reason is required.");
            return;
        }

        try {
            setError("");
            setLoading(true);

            const res = await EventService.rejectEvent(
                event.event_id,
                rejectionReason.trim()
            );

            if (res.status === 200) {
                onReviewed(res.data.message);
                setRejectionReason("");
                setShowRejectForm(false);
                refreshKey();
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string) =>
        new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    // Fix 2: guard event null in statusBadge
    const statusBadge = () => {
        if (!event) return null; // ← add this guard

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

    // Fix 1: wrap onClose to reset state
    const handleClose = () => {
        setRejectionReason("");
        setShowRejectForm(false);
        setError("");
        onClose();
    };

    if (!event) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton>
            <div className="space-y-6">

                {/* Hero Header — mirrors ViewEventModal */}
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-cyan-500/10 p-3">
                            <CalendarDays className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Review Event Request
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Approve or reject this event submission.
                            </p>
                            <div className="mt-3">
                                {statusBadge()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Details */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400" />
                        <h3 className="font-semibold text-white">Activity Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Activity Title</p>
                            <p className="mt-1 font-medium text-white">{event.activity_title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Description</p>
                            <p className="mt-1 font-medium text-white">
                                {event.activity_description || "—"}
                            </p>
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
                                <p className="mt-1 font-medium text-white">
                                    {event.venue?.venue_name ?? "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Department</p>
                                <p className="mt-1 font-medium text-white">
                                    {event.department?.department_name ?? "—"}
                                </p>
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
                            <p className="mt-1 font-medium text-white">
                                {event.telephone_number ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Actions — always visible since this is the review modal */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-purple-400" />
                        <h3 className="font-semibold text-white">Administrative Actions</h3>
                    </div>

                    {event.status === "pending" && !showRejectForm && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                disabled={loading}
                                onClick={handleApprove}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                                <CheckCircle size={16} />
                                {loading ? "Processing..." : "Approve"}
                            </button>

                            <button
                                disabled={loading}
                                onClick={() => setShowRejectForm(true)}
                                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                <XCircle size={16} />
                                Reject
                            </button>
                        </div>
                    )}

                    {event.status !== "pending" && (
                        <p className="text-sm text-gray-500 italic">
                            This event has already been {event.status}. No further action needed.
                        </p>
                    )}

                    {/* Rejection form — inline, same as ViewEventModal */}
                    {showRejectForm && (
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                                    Rejection Reason{" "}
                                    <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        if (error && e.target.value.trim()) {
                                            setError("");
                                        }
                                    }}
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    required
                                    className={`w-full rounded-2xl bg-black/20 p-4 text-sm text-white outline-none resize-none
                                        ${
                                            error
                                                ? "border border-red-500 focus:border-red-500"
                                                : "border border-white/10 focus:border-red-500"
                                        }`}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    <XCircle size={16} />
                                    {loading ? "Rejecting..." : "Confirm Reject"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason("");
                                        setError("");
                                    }}
                                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                    <CloseButton label="Close" onClose={handleClose} />
                </div>

            </div>
        </Modal>
    );
};

export default AdminEventReviewModal;