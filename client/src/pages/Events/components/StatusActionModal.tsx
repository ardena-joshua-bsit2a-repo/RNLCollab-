import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import EventService from "../../../services/EventService";
import type { EventColumns } from "../../../interfaces/EventInterface";

interface StatusActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventColumns | null;
    onActioned: (message: string) => void;
    refreshKey: () => void;
}

const StatusActionModal: FC<StatusActionModalProps> = ({
    isOpen, onClose, event, onActioned, refreshKey
}) => {
    const [loading, setLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    if (!event) return null;

    const handleRevert = async () => {
        try {
            setLoading(true);
            const res = await EventService.revertEvent(event.event_id);
            if (res.status === 200) {
                onActioned(res.data.message);
                refreshKey();
                onClose();
            }
        } catch (err) {
            console.error("Revert error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            const res = await EventService.approveEvent(event.event_id);
            if (res.status === 200) {
                onActioned(res.data.message);
                refreshKey();
                onClose();
            }
        } catch (err) {
            console.error("Approve error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            const res = await EventService.rejectEvent(event.event_id, rejectionReason);
            if (res.status === 200) {
                onActioned(res.data.message);
                setRejectionReason("");
                setShowRejectForm(false);
                refreshKey();
                onClose();
            }
        } catch (err) {
            console.error("Reject error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Need to allow re-approve from rejected — bypass the pending check
    // So approveEvent backend needs a small tweak (see Fix 7)

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 px-1">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Change Booking Status
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage the status of this booking.
                </p>
            </div>

            {/* Event summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-1.5 text-sm">
                <p><span className="font-medium">Title:</span> {event.activity_title}</p>
                <p><span className="font-medium">Requested By:</span> {event.requested_by}</p>
                <p><span className="font-medium">Date:</span> {event.date}</p>
                <p><span className="font-medium">Venue:</span> {event.venue?.venue_name}</p>
                <p>
                    <span className="font-medium">Current Status: </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        event.status === "approved" ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                        {event.status?.toUpperCase()}
                    </span>
                </p>
            </div>

            {/* Rejection reason input (for re-reject) */}
            {showRejectForm && (
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Rejection Reason (optional)
                    </label>
                    <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm
                                   bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                {!loading && <CloseButton label="Close" onClose={onClose} />}

                {/* APPROVED → can only Unapprove (revert to pending) */}
                {event.status === "approved" && !showRejectForm && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleRevert}
                        className="px-4 py-2 text-sm rounded-md bg-amber-100 text-amber-700
                                   hover:bg-amber-200 transition disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Unapprove (revert to pending)"}
                    </button>
                )}

                {/* REJECTED → can Unreject (revert to pending) OR directly Approve OR Re-reject */}
                {event.status === "rejected" && (
                    <>
                        {!showRejectForm ? (
                            <>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleRevert}
                                    className="px-4 py-2 text-sm rounded-md bg-amber-100 text-amber-700
                                               hover:bg-amber-200 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Unreject (revert to pending)"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleApprove}
                                    className="px-4 py-2 text-sm rounded-md bg-green-600 text-white
                                               hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Approve directly"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectForm(false)}
                                    className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-600
                                               hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleReject}
                                    className="px-4 py-2 text-sm rounded-md bg-red-600 text-white
                                               hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Rejecting..." : "Confirm Reject"}
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

        </Modal>
    );
};

export default StatusActionModal;