import { useEffect, useState, type FC } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from "../../../components/Table";

import Spinner from "../../../components/Spinner/Spinner";
import UserService from "../../../services/UserService";

import type { UserColumns }
from "../../../interfaces/UserInterface";

import {
    Archive,
    RefreshCw,
    Search,
    Trash2,
    RotateCcw,
    Users
} from "lucide-react";

interface TrashUserListProps {
    refreshKey: boolean;
    onRestoreUser: (message: string) => void;
    onPermanentDelete: (message: string) => void;
}

const TrashUserList: FC<TrashUserListProps> = ({
    refreshKey,
    onRestoreUser,
    onPermanentDelete
}) => {

    const [loadingUsers, setLoadingUsers] =
        useState(false);

    const [users, setUsers] =
        useState<UserColumns[]>([]);

    const [search, setSearch] =
        useState("");

    const handleLoadTrashUsers = async () => {

        try {

            setLoadingUsers(true);

            const res =
                await UserService.loadTrashUsers();

            if (res.status === 200) {
                setUsers(res.data.users);
            }

        } catch (error) {

            console.error(
                "Error loading trash users:",
                error
            );

        } finally {

            setLoadingUsers(false);

        }
    };

    const handleRestoreUser = async (
        userId: number
    ) => {

        try {

            const res =
                await UserService.restoreUser(
                    userId
                );

            if (res.status === 200) {

                onRestoreUser(
                    res.data.message
                );

                handleLoadTrashUsers();
            }

        } catch (error) {

            console.error(
                "Error restoring user:",
                error
            );
        }
    };

    const handlePermanentDelete = async (
        userId: number
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to permanently delete this user?"
            );

        if (!confirmDelete) return;

        try {

            const res =
                await UserService.forceDeleteUser(
                    userId
                );

            if (res.status === 200) {

                onPermanentDelete(
                    res.data.message
                );

                handleLoadTrashUsers();
            }

        } catch (error) {

            console.error(
                "Error permanently deleting user:",
                error
            );
        }
    };

    useEffect(() => {

        handleLoadTrashUsers();

    }, [refreshKey]);

    const handleUserFullNameFormat = (
        user: UserColumns
    ) => {

        let fullName = user.middle_name
            ? `${user.last_name}, ${user.first_name} ${user.middle_name.charAt(0)}.`
            : `${user.last_name}, ${user.first_name}`;

        if (user.suffix_name) {
            fullName += ` ${user.suffix_name}`;
        }

        return fullName;
    };

    const handleUserInitials = (
        user: UserColumns
    ) => {

        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
            .toUpperCase();
    };

    const getProfilePhotoUrl = (
        path: string
    ) => {

        if (path.startsWith("http")) {
            return path;
        }

        return `${import.meta.env.VITE_BACKEND_URL}${path}`;
    };

    const filteredUsers =
        users.filter((user) => {

            const fullName =
                handleUserFullNameFormat(user)
                    .toLowerCase();

            return (
                fullName.includes(
                    search.toLowerCase()
                ) ||
                user.email
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    ) ||
                user.username
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
            );
        });

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
                                Trash Users
                            </h1>

                            <p className="mt-1 text-gray-400">
                                Restore deleted users or permanently remove them.
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={handleLoadTrashUsers}
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
                        Deleted Users
                    </p>

                    <div className="mt-3 flex items-center gap-3">

                        <Trash2 className="text-red-400" />

                        <span className="text-3xl font-bold text-white">
                            {users.length}
                        </span>

                    </div>

                </div>

                <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-5">

                    <p className="text-sm text-gray-400">
                        Filtered Results
                    </p>

                    <div className="mt-3 flex items-center gap-3">

                        <Users className="text-cyan-400" />

                        <span className="text-3xl font-bold text-white">
                            {filteredUsers.length}
                        </span>

                    </div>

                </div>

            </div>

            {/* FILTER */}

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
                        className="
                            absolute left-3 top-1/2
                            -translate-y-1/2
                            text-gray-500
                        "
                    />

                    <input
                        type="text"
                        placeholder="Search user..."
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

                                <TableCell isHeader className="px-5 py-3 text-center">
                                    PROFILE
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    FULL NAME
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    ROLE
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    DEPARTMENT
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3">
                                    EMAIL
                                </TableCell>

                                <TableCell isHeader className="px-5 py-3 text-center">
                                    ACTIONS
                                </TableCell>

                            </TableRow>

                        </TableHeader>

                        <TableBody className="divide-y divide-white/5 text-sm text-gray-300">

                            {loadingUsers ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center"
                                    >
                                        <Spinner size="md" />
                                    </TableCell>

                                </TableRow>

                            ) : filteredUsers.length === 0 ? (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-gray-500"
                                    >
                                        No deleted users found.
                                    </TableCell>

                                </TableRow>

                            ) : (

                                filteredUsers.map(
                                    (user, index) => (

                                        <TableRow
                                            key={user.user_id}
                                            className="hover:bg-white/[0.03]"
                                        >

                                            <TableCell className="px-4 py-3 text-center">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-center">

                                                {user.profile_photo ? (

                                                    <img
                                                        src={getProfilePhotoUrl(
                                                            user.profile_photo
                                                        )}
                                                        alt="Profile"
                                                        className="mx-auto h-10 w-10 rounded-full object-cover"
                                                    />

                                                ) : (

                                                    <div className="
                                                        mx-auto
                                                        flex h-10 w-10
                                                        items-center justify-center
                                                        rounded-full
                                                        bg-gradient-to-br
                                                        from-blue-500
                                                        to-cyan-500
                                                        text-sm font-bold text-white
                                                    ">
                                                        {handleUserInitials(user)}
                                                    </div>

                                                )}

                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {handleUserFullNameFormat(user)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {user.role?.role_name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {user.department?.department_name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {user.email}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">

                                                <div className="flex gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleRestoreUser(
                                                                user.user_id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            bg-emerald-500/10
                                                            px-3 py-1.5
                                                            text-sm font-medium
                                                            text-emerald-400
                                                            hover:bg-emerald-500/20
                                                        "
                                                    >
                                                        Restore
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handlePermanentDelete(
                                                                user.user_id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            bg-red-500/10
                                                            px-3 py-1.5
                                                            text-sm font-medium
                                                            text-red-400
                                                            hover:bg-red-500/20
                                                        "
                                                    >
                                                        Delete Permanently
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

export default TrashUserList;