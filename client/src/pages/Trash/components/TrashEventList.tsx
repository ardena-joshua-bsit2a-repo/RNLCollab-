import { useEffect, useState, type FC } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from "../../../components/Table";

import Spinner from "../../../components/Spinner/Spinner";
import EventService from "../../../services/EventService";

import type { EventColumns }
from "../../../interfaces/EventInterface";

import {
    Trash2,
    RotateCcw,
    CalendarDays,
    Search,
    RefreshCw,
    Archive
} from "lucide-react";

interface TrashEventListProps {
    refreshKey: boolean;
    onRestoreEvent: (message: string) => void;
    onPermanentDelete: (message: string) => void;
}

const TrashEventList: FC<TrashEventListProps> = ({
    refreshKey,
    onRestoreEvent,
    onPermanentDelete
}) => {

    const [loadingEvents, setLoadingEvents] =
        useState(false);

    const [events, setEvents] =
        useState<EventColumns[]>([]);

    const [search, setSearch] =
        useState("");

    const handleLoadTrashEvents = async () => {

        try {

            setLoadingEvents(true);

            const res =
                await EventService.loadTrashEvent();

            if (res.status === 200) {
                setEvents(res.data.events);
            }

        } catch (error) {

            console.error(
                "Error loading trash events:",
                error
            );

        } finally {

            setLoadingEvents(false);

        }
    };

    const handleRestoreEvent = async (
        eventId: number
    ) => {

        try {

            const res =
                await EventService.restoreEvent(
                    eventId
                );

            if (res.status === 200) {

                onRestoreEvent(
                    res.data.message
                );

                handleLoadTrashEvents();
            }

        } catch (error) {

            console.error(
                "Error restoring event:",
                error
            );
        }
    };

    const handlePermanentDelete = async (
        eventId: number
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to permanently delete this event?"
            );

        if (!confirmDelete) return;

        try {

            const res =
                await EventService.forceDeleteEvent(
                    eventId
                );

            if (res.status === 200) {

                onPermanentDelete(
                    res.data.message
                );

                handleLoadTrashEvents();
            }

        } catch (error) {

            console.error(
                "Error permanently deleting event:",
                error
            );
        }
    };

    useEffect(() => {

        handleLoadTrashEvents();

    }, [refreshKey]);

    const filteredEvents =
        events.filter((event) =>
            event.activity_title
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    return (

        <div className="space-y-6">

            {/* HERO */}

            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">

                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="rounded-2xl bg-red-500/10 p-3">

                            <Archive className="h-6 w-6 text-red-400" />

                        </div>

                        <div>

                            <h1 className="text-4xl font-bold text-white">
                                Trash Events
                            </h1>

                            <p className="mt-1 text-gray-400">
                                Restore deleted events or permanently remove them.
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={handleLoadTrashEvents}
                        className="
                            flex items-center gap-2
                            rounded-2xl
                            bg-blue-600
                            px-5 py-3
                            text-sm font-medium
                            text-white
                            hover:bg-blue-500
                        "
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-5">

                    <p className="text-sm text-gray-400">
                        Deleted Events
                    </p>

                    <div className="mt-3 flex items-center gap-3">

                        <Trash2 className="text-red-400" />

                        <span className="text-3xl font-bold text-white">
                            {events.length}
                        </span>

                    </div>

                </div>

                <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-5">

                    <p className="text-sm text-gray-400">
                        Filtered Results
                    </p>

                    <div className="mt-3 flex items-center gap-3">

                        <CalendarDays className="text-cyan-400" />

                        <span className="text-3xl font-bold text-white">
                            {filteredEvents.length}
                        </span>

                    </div>

                </div>

            </div>

            {/* FILTERS */}

            <div
                className="
                    flex flex-wrap items-center gap-3
                    rounded-3xl
                    border border-white/5
                    bg-slate-900/60
                    p-4
                    backdrop-blur-xl
                "
            >

                <div className="relative">

                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                        type="text"
                        placeholder="Search event title..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="
                            w-72
                            rounded-2xl
                            border border-white/10
                            bg-black/20
                            py-3 pl-10 pr-4
                            text-white
                            outline-none
                            focus:border-blue-500
                        "
                    />

                </div>

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">

                <div className="overflow-x-auto">

                    <Table>

                        <TableHeader className="sticky top-0 border-b border-white/10 bg-black/50 text-xs text-gray-300">

                            <TableRow>

                                <TableCell isHeader className="px-5 py-3 text-center">
                                    NO.
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    ACTIVITY
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    DATE
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    REQUESTED BY
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    VENUE
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    DEPARTMENT
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3 text-center">
                                    ACTIONS
                                </TableCell>

                            </TableRow>

                        </TableHeader>

                        <TableBody className="divide-y divide-white/5 text-sm text-gray-300">

                            {loadingEvents ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center"
                                    >
                                        <Spinner size="md" />
                                    </TableCell>

                                </TableRow>

                            ) : filteredEvents.length === 0 ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-gray-500"
                                    >
                                        No deleted events found.
                                    </TableCell>

                                </TableRow>

                            ) : (

                                filteredEvents.map(
                                    (event, index) => (

                                        <TableRow
                                            key={event.event_id}
                                            className="hover:bg-white/[0.03]"
                                        >

                                            <TableCell className="px-4 py-3 text-center">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {event.activity_title}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {event.date}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {event.requested_by}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {event.venue?.venue_name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {event.department?.department_name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">

                                                <div className="flex gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleRestoreEvent(
                                                                event.event_id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            bg-emerald-500/10
                                                            px-3 py-1.5
                                                            text-sm
                                                            font-medium
                                                            text-emerald-400
                                                            hover:bg-emerald-500/20
                                                        "
                                                    >
                                                        Restore
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handlePermanentDelete(
                                                                event.event_id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            bg-red-500/10
                                                            px-3 py-1.5
                                                            text-sm
                                                            font-medium
                                                            text-red-400
                                                            hover:bg-red-500/20
                                                        "
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

        </div>
    );
};

export default TrashEventList;