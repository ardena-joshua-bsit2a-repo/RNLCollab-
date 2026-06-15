import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import type { EventColumns } from "../../../interfaces/EventInterface";
import EventService from "../../../services/EventService";
import {
    Trash2,
    Calendar,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    Building2,
    FileText,
    CalendarDays,
    AlertTriangle,
} from "lucide-react";

interface DeleteEventFormModalProps {
    event: EventColumns | null;
    onDeleteEvent: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteEventFormModal: FC<DeleteEventFormModalProps> = ({
    event,
    onDeleteEvent,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);

    const [activityTitle, setActivityTitle] = useState("");
    const [activityDescription, setActivityDescription] = useState("");
    const [date, setDate] = useState("");
    const [numberOfDays, setNumberOfDays] = useState<number>(1);
    const [timeStart, setTimeStart] = useState("");
    const [timeEnd, setTimeEnd] = useState("");
    const [requestedBy, setRequestedBy] = useState("");
    const [telephoneNumber, setTelephoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [venue, setVenue] = useState("");
    const [department, setDepartment] = useState("");

    const formatTime = (time: string) =>
        new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const handleDestroyEvent = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoadingDestroy(true);
            const res = await EventService.destroyEvent(event?.event_id!);
            if (res.status === 200) {
                onDeleteEvent(res.data.message);
                refreshKey();
                onClose();
            } else {
                console.error("Unexpected error during deleting event:", res.status);
            }
        } catch (error) {
            console.error("Unexpected server error during deleting event:", error);
        } finally {
            setLoadingDestroy(false);
        }
    };

    useEffect(() => {
        if (event) {
            setActivityTitle(event.activity_title);
            setActivityDescription(event.activity_description ?? "");
            setDate(event.date);
            setNumberOfDays(event.number_of_days);
            setTimeStart(event.time_start);
            setTimeEnd(event.time_end);
            setRequestedBy(event.requested_by);
            setTelephoneNumber(event.telephone_number ?? "");
            setEmail(event.email);
            setUser(`${event.user.first_name} ${event.user.last_name}`);
            setVenue(event.venue.venue_name);
            setDepartment(event.department.department_name);
        } else {
            console.error("Unexpected event error during getting event details:", event);
        }
    }, [event]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyEvent} className="space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
                    <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-red-500/10 p-3">
                            <Trash2 className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Delete Event</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Details */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400" />
                        <h3 className="font-semibold text-white">Activity Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Activity Title</p>
                            <p className="mt-1 text-sm font-medium text-white">{activityTitle || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Description</p>
                            <p className="mt-1 text-sm font-medium text-white">{activityDescription || "—"}</p>
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
                        <div className="space-y-3">
                            <InfoRow label="Date" value={date} icon={<CalendarDays size={14} />} />
                            <InfoRow label="Duration" value={`${numberOfDays} day(s)`} icon={<CalendarDays size={14} />} />
                            <InfoRow
                                label="Time"
                                value={timeStart && timeEnd ? `${formatTime(timeStart)} – ${formatTime(timeEnd)}` : "—"}
                                icon={<Clock size={14} />}
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-emerald-400" />
                            <h3 className="font-semibold text-white">Venue</h3>
                        </div>
                        <div className="space-y-3">
                            <InfoRow label="Location" value={venue} icon={<MapPin size={14} />} />
                            <InfoRow label="Department" value={department} icon={<Building2 size={14} />} />
                            <InfoRow label="Submitted By" value={user} icon={<User size={14} />} />
                        </div>
                    </div>

                </div>

                {/* Person in Charge */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <User size={18} className="text-amber-400" />
                        <h3 className="font-semibold text-white">Person in Charge</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoRow label="Requested By" value={requestedBy} icon={<User size={14} />} />
                        <InfoRow label="Email" value={email} icon={<Mail size={14} />} />
                        <InfoRow label="Telephone" value={telephoneNumber || "—"} icon={<Phone size={14} />} />
                    </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-200">
                        Deleting this event will permanently remove it and all related data. This cannot be recovered.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {!loadingDestroy && (
                        <CloseButton label="Cancel" onClose={onClose} />
                    )}
                    <SubmitButton
                        className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                        label="Delete Event"
                        loading={loadingDestroy}
                        loadingLabel="Deleting Event..."
                    />
                </div>

            </form>
        </Modal>
    );
};

export default DeleteEventFormModal;

/* ---------- Info Row ---------- */
const InfoRow = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) => (
    <div className="flex items-start gap-2">
        <div className="text-gray-500 mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-white truncate">{value || "—"}</p>
        </div>
    </div>
);