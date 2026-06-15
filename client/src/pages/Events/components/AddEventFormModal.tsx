import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import Modal from "../../../components/Modal"
import FloatingLabelSelect from "../../../components/Select/FloatingLabelselect"
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";
import { useEffect, useState, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";

import UserService from "../../../services/UserService";
import VenueService from "../../../services/VenueService";
import DepartmentService from "../../../services/DepartmentService";
import EventService from "../../../services/EventService";

import type { EventFieldErrors } from "../../../interfaces/EventInterface";
import type { UserColumns } from "../../../interfaces/UserInterface";
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface";
import type { VenueColumns } from "../../../interfaces/VenueInterface";

import {
    CalendarDays,
    User,
    MapPin,
    FileText,
    CalendarPlus,
    AlertTriangle,
} from "lucide-react";

interface AddEventFormModalProps {
    onEventAdded: (message: string) => void
    isOpen: boolean;
    onClose: () => void;
    refreshKey: () => void;
}

const AddEventFormModal: FC<AddEventFormModalProps> = ({
    onEventAdded,
    isOpen,
    onClose,
    refreshKey
}) => {
    const { isSuperAdmin, user } = useAuth();

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<UserColumns[]>([]);

    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([]);

    const [loadingVenues, setLoadingVenues] = useState(false);
    const [venues, setVenues] = useState<VenueColumns[]>([]);

    const [loadingStore, setLoadingStore] = useState(false);

    const [activityTitle, setActivityTitle] = useState("");
    const [activityDescription, setActivityDescription] = useState("");
    const [date, setDate] = useState("");
    const [numberOfDays, setNumberOfDays] = useState("");
    const [timeStart, setTimeStart] = useState("");
    const [timeEnd, setTimeEnd] = useState("");
    const [requestedBy, setRequestedBy] = useState("");
    const [telephoneNumber, setTelephoneNumber] = useState("");
    const [email, setEmail] = useState("");

    const [userId, setUserId] = useState("");
    const [venueId, setVenueId] = useState("");
    const [departmentId, setDepartmentId] = useState("");

    const [errors, setErrors] = useState<EventFieldErrors>({});

    const [conflictWarning, setConflictWarning] = useState<string | null>(null);
    const [checkingConflict, setCheckingConflict] = useState(false);

    const handleStoreEvent = async (e: FormEvent) => {
        e.preventDefault();
        setConflictWarning(null);

        if (venueId && date && timeStart && timeEnd) {
            try {
                setCheckingConflict(true);
                const conflictRes = await EventService.checkConflict({
                    venue_id:      venueId,
                    department_id: isSuperAdmin ? departmentId : user?.department_id,
                    date,
                    time_start:    timeStart,
                    time_end:      timeEnd,
                });

                if (conflictRes.data.has_conflict) {
                    const c = conflictRes.data.conflicts[0];
                    setConflictWarning(
                        `Conflict detected with "${c.activity_title}" on ${c.date} ` +
                        `(${c.time_start}–${c.time_end}) at ${c.venue_name}. ` +
                        `Type: ${c.conflict_type}. Your request will be auto-rejected if submitted.`
                    );
                    return;
                }
            } catch (err) {
                console.error("Conflict check failed:", err);
            } finally {
                setCheckingConflict(false);
            }
        }

        try {
            setLoadingStore(true);

            const payload = {
                activity_title:       activityTitle,
                activity_description: activityDescription,
                date,
                number_of_days:       numberOfDays,
                time_start:           timeStart,
                time_end:             timeEnd,
                requested_by:         requestedBy,
                telephone_number:     telephoneNumber,
                email,
                user_id:              isSuperAdmin ? userId : user?.user_id,
                venue_id:             venueId,
                department_id:        isSuperAdmin ? departmentId : user?.department_id,
            };

            const res = await EventService.storeEvent(payload);

            if (res.status === 200) {
                onEventAdded(res.data.message);

                setActivityTitle("");
                setActivityDescription("");
                setDate("");
                setNumberOfDays("");
                setTimeStart("");
                setTimeEnd("");
                setRequestedBy("");
                setTelephoneNumber("");
                setEmail("");
                setUserId("");
                setVenueId("");
                setDepartmentId("");
                setErrors({});
                setConflictWarning(null);

                refreshKey();
                onClose();
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Unexpected error storing event:", error);
            }
        } finally {
            setLoadingStore(false);
        }
    };

    const handleLoadUsers = async () => {
        try {
            setLoadingUsers(true);
            const res = await UserService.loadUsers();
            if (res.status === 200) setUsers(res.data.users);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleLoadDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const res = await DepartmentService.loadDepartment();
            if (res.status === 200) setDepartments(res.data.departments);
        } catch (error) {
            console.error("Error loading departments:", error);
        } finally {
            setLoadingDepartments(false);
        }
    };

    const handleLoadVenues = async () => {
        try {
            setLoadingVenues(true);
            const res = await VenueService.loadVenue();
            if (res.status === 200) setVenues(res.data.venues);
        } catch (error) {
            console.error("Error loading venues:", error);
        } finally {
            setLoadingVenues(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleLoadVenues();
            if (isSuperAdmin) {
                handleLoadUsers();
                handleLoadDepartments();
            }
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleStoreEvent} className="space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-emerald-500/10 p-3">
                            <CalendarPlus className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Add Event</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Fill in the event information below to create a new booking.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Details */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-400" />
                        <h2 className="font-semibold text-white">Activity Details</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <FloatingLabelInput
                            label="Activity Title"
                            type="text"
                            name="activity_title"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            errors={errors.activity_title}
                            required
                            autoFocus
                        />

                        <FloatingLabelInput
                            label="Activity Description"
                            type="text"
                            name="activity_description"
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            errors={errors.activity_description}
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <CalendarDays size={18} className="text-blue-400" />
                        <h2 className="font-semibold text-white">Schedule</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                            label="Date"
                            type="date"
                            name="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            errors={errors.date}
                            required
                        />

                        <FloatingLabelInput
                            label="Number of Days"
                            type="number"
                            name="number_of_days"
                            value={numberOfDays}
                            onChange={(e) => setNumberOfDays(e.target.value)}
                            errors={errors.number_of_days}
                            required
                        />

                        <FloatingLabelInput
                            label="Start Time"
                            type="time"
                            name="time_start"
                            value={timeStart}
                            onChange={(e) => setTimeStart(e.target.value)}
                            errors={errors.time_start}
                            required
                        />

                        <FloatingLabelInput
                            label="End Time"
                            type="time"
                            name="time_end"
                            value={timeEnd}
                            onChange={(e) => setTimeEnd(e.target.value)}
                            errors={errors.time_end}
                            required
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <User size={18} className="text-amber-400" />
                        <h2 className="font-semibold text-white">Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingLabelInput
                            label="Requested By"
                            type="text"
                            name="requested_by"
                            value={requestedBy}
                            onChange={(e) => setRequestedBy(e.target.value)}
                            errors={errors.requested_by}
                            required
                        />

                        <FloatingLabelInput
                            label="Telephone Number"
                            type="text"
                            name="telephone_number"
                            value={telephoneNumber}
                            onChange={(e) => setTelephoneNumber(e.target.value)}
                            errors={errors.telephone_number}
                        />

                        <div className="md:col-span-2">
                            <FloatingLabelInput
                                label="Email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                errors={errors.email}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Venue & Assignment */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <MapPin size={18} className="text-cyan-400" />
                        <h2 className="font-semibold text-white">Venue & Assignment</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingLabelSelect
                            label="Venue"
                            name="venue_id"
                            value={venueId}
                            onChange={(e) => setVenueId(e.target.value)}
                            errors={errors.venue_id}
                        >
                            {loadingVenues ? (
                                <option value="">Loading...</option>
                            ) : (
                                <>
                                    <option value="">Select Venue</option>
                                    {venues.map((v, i) => (
                                        <option value={v.venue_id} key={i}>
                                            {v.venue_name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </FloatingLabelSelect>

                        {isSuperAdmin && (
                            <FloatingLabelSelect
                                label="User"
                                name="user_id"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                errors={errors.user_id}
                            >
                                {loadingUsers ? (
                                    <option value="">Loading...</option>
                                ) : (
                                    <>
                                        <option value="">Select User</option>
                                        {users.map((u, i) => (
                                            <option value={u.user_id} key={i}>
                                                {u.first_name} {u.last_name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </FloatingLabelSelect>
                        )}

                        {isSuperAdmin && (
                            <div className="md:col-span-2">
                                <FloatingLabelSelect
                                    label="Department"
                                    name="department_id"
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    errors={errors.department_id}
                                >
                                    {loadingDepartments ? (
                                        <option value="">Loading...</option>
                                    ) : (
                                        <>
                                            <option value="">Select Department</option>
                                            {departments.map((d, i) => (
                                                <option value={d.department_id} key={i}>
                                                    {d.department_name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </FloatingLabelSelect>
                            </div>
                        )}

                    </div>
                </div>

                {/* Conflict Warning */}
                {conflictWarning && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                        <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-200">{conflictWarning}</p>
                    </div>
                )}

                {/* Checking conflict inline indicator */}
                {checkingConflict && (
                    <p className="text-sm text-gray-400 text-center animate-pulse">
                        Checking for conflicts...
                    </p>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {!loadingStore && (
                        <CloseButton label="Cancel" onClose={onClose} />
                    )}
                    <SubmitButton
                        label="Save Event"
                        loading={loadingStore || checkingConflict}
                        loadingLabel={checkingConflict ? "Checking conflicts..." : "Saving Event..."}
                    />
                </div>

            </form>
        </Modal>
    );
}

export default AddEventFormModal