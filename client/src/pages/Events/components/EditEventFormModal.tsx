import { useEffect, useState, type FC, type FormEvent } from "react"
import CloseButton from "../../../components/Button/CloseButton"
import SubmitButton from "../../../components/Button/SubmitButton"
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import Modal from "../../../components/Modal"
import FloatingLabelSelect from "../../../components/Select/FloatingLabelselect"
import { useAuth } from "../../../contexts/AuthContext"

import DepartmentService from "../../../services/DepartmentService"
import UserService from "../../../services/UserService"
import VenueService from "../../../services/VenueService"
import EventService from "../../../services/EventService"

import type { EventColumns, EventFieldErrors } from "../../../interfaces/EventInterface"
import type { UserColumns } from "../../../interfaces/UserInterface"
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface"
import type { VenueColumns } from "../../../interfaces/VenueInterface"

import {
    CalendarDays,
    Clock,
    User,
    Building2,
    MapPin,
    Phone,
    Mail,
    Pencil,
    FileText,
    Shield,
} from "lucide-react"

interface EditEventFormModalProps {
    event: EventColumns | null
    onEventUpdated: (message: string) => void
    refreshKey: () => void
    isOpen: boolean
    onClose: () => void
}

const EditEventFormModal: FC<EditEventFormModalProps> = ({
    event,
    onEventUpdated,
    refreshKey,
    isOpen,
    onClose
}) => {
    const { isSuperAdmin, user } = useAuth()

    const [loadingUsers, setLoadingUsers] = useState(false)
    const [users, setUsers] = useState<UserColumns[]>([])

    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([])

    const [loadingVenues, setLoadingVenues] = useState(false)
    const [venues, setVenues] = useState<VenueColumns[]>([])

    const [loadingUpdate, setLoadingUpdate] = useState(false)

    const [activityTitle, setActivityTitle] = useState("")
    const [activityDescription, setActivityDescription] = useState("")
    const [date, setDate] = useState("")
    const [numberOfDays, setNumberOfDays] = useState("1")
    const [timeStart, setTimeStart] = useState("")
    const [timeEnd, setTimeEnd] = useState("")
    const [requestedBy, setRequestedBy] = useState("")
    const [telephoneNumber, setTelephoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [userId, setUserId] = useState("")
    const [venueId, setVenueId] = useState("")
    const [departmentId, setDepartmentId] = useState("")

    const [errors, setErrors] = useState<EventFieldErrors>({})

    const handleUpdateEvent = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setLoadingUpdate(true)

            const payload = {
                activity_title: activityTitle,
                activity_description: activityDescription,
                date,
                number_of_days: numberOfDays,
                time_start: timeStart,
                time_end: timeEnd,
                requested_by: requestedBy,
                telephone_number: telephoneNumber,
                email,
                user_id: isSuperAdmin ? userId : user?.user_id,
                venue_id: venueId,
                department_id: isSuperAdmin ? departmentId : user?.department_id,
            }

            const res = await EventService.updateEvent(event?.event_id!, payload)

            if (res.status === 200) {
                onEventUpdated(res.data.message)
                refreshKey()
                setErrors({})
                onClose()
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                console.error("Unexpected error updating event:", error)
            }
        } finally {
            setLoadingUpdate(false)
        }
    }

    const handleLoadUsers = async () => {
        try {
            setLoadingUsers(true)
            const res = await UserService.loadUsers()
            if (res.status === 200) setUsers(res.data.users)
        } catch (error) {
            console.error("Error loading users:", error)
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleLoadDepartments = async () => {
        try {
            setLoadingDepartments(true)
            const res = await DepartmentService.loadDepartment()
            if (res.status === 200) setDepartments(res.data.departments)
        } catch (error) {
            console.error("Error loading departments:", error)
        } finally {
            setLoadingDepartments(false)
        }
    }

    const handleLoadVenues = async () => {
        try {
            setLoadingVenues(true)
            const res = await VenueService.loadVenue()
            if (res.status === 200) setVenues(res.data.venues)
        } catch (error) {
            console.error("Error loading venues:", error)
        } finally {
            setLoadingVenues(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            handleLoadVenues()
            if (isSuperAdmin) {
                handleLoadUsers()
                handleLoadDepartments()
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && event) {
            setActivityTitle(event.activity_title)
            setActivityDescription(event.activity_description ?? "")
            setDate(event.date)
            setNumberOfDays(event.number_of_days.toString())
            setTimeStart(event.time_start)
            setTimeEnd(event.time_end)
            setRequestedBy(event.requested_by)
            setTelephoneNumber(event.telephone_number ?? "")
            setEmail(event.email)
            setVenueId(event.venue?.venue_id.toString() ?? "")

            if (isSuperAdmin) {
                setUserId(event.user?.user_id.toString() ?? "")
                setDepartmentId(event.department?.department_id.toString() ?? "")
            }
        }
    }, [isOpen, event])

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleUpdateEvent} className="space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-cyan-500/10 p-3">
                            <Pencil className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Edit Booking
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Update your event booking details and schedule.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Details */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400" />
                        <h2 className="font-semibold text-white">Activity Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
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
                        </div>

                        <div className="md:col-span-2">
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
                        <User size={18} className="text-emerald-400" />
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
                        <MapPin size={18} className="text-amber-400" />
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
                                        <option key={i} value={v.venue_id}>
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
                                            <option key={i} value={u.user_id}>
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
                                                <option key={i} value={d.department_id}>
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

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {!loadingUpdate && (
                        <CloseButton label="Cancel" onClose={onClose} />
                    )}
                    <SubmitButton
                        label="Update Booking"
                        loading={loadingUpdate}
                        loadingLabel="Updating..."
                    />
                </div>

            </form>
        </Modal>
    )
}

export default EditEventFormModal