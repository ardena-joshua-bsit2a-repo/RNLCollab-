import { type FC, type FormEvent, useState } from "react";
import Modal from "../../../components/Modal";
import type { UserColumns } from "../../../interfaces/UserInterface";
import UserService from "../../../services/UserService";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import {
    Trash2,
    User,
    Mail,
    Shield,
    Building2,
    AtSign,
    AlertTriangle,
    CircleCheck,
    CircleX,
    Calendar,
} from "lucide-react";

interface DeleteUserFormModalProps {
    user: UserColumns | null;
    onDeleteUser: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteUserFormModal: FC<DeleteUserFormModalProps> = ({
    user,
    onDeleteUser,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);

    const handleDestroyUser = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoadingDestroy(true);
            const res = await UserService.destroyUser(user?.user_id!);
            if (res.status === 200) {
                onDeleteUser(res.data.message);
                refreshKey();
                onClose();
            } else {
                console.error("Unexpected error:", res.status);
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setLoadingDestroy(false);
        }
    };

    if (!user) return null;

    const getProfilePhotoUrl = (path: string) =>
        `${import.meta.env.VITE_BACKEND_URL}${path}`;

    const getInitials = () =>
        `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

    const getFullName = () => {
        let fullName = user.middle_name
            ? `${user.last_name}, ${user.first_name} ${user.middle_name.charAt(0)}.`
            : `${user.last_name}, ${user.first_name}`;
        if (user.suffix_name) fullName += ` ${user.suffix_name}`;
        return fullName;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDestroyUser} className="space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
                    <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-red-500/10 p-3">
                            <Trash2 className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Delete User</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Section — mirrors UserViewModal exactly */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="flex flex-col items-center">

                        {user.profile_photo ? (
                            <img
                                src={getProfilePhotoUrl(user.profile_photo)}
                                alt={getInitials()}
                                className="h-28 w-28 rounded-full object-cover border-4 border-red-500 shadow-lg shadow-red-500/20"
                            />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-3xl font-bold text-white">
                                {getInitials()}
                            </div>
                        )}

                        <h2 className="mt-4 text-xl font-bold text-white">
                            {getFullName()}
                        </h2>

                        <p className="text-gray-400">@{user.username}</p>

                        <div className="mt-3">
                            {(user.status ?? "active") === "active" ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-medium text-emerald-400">
                                    <CircleCheck size={14} />
                                    ACTIVE
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-xs font-medium text-red-400">
                                    <CircleX size={14} />
                                    INACTIVE
                                </span>
                            )}
                        </div>

                    </div>
                </div>

                {/* Account + Organization — mirrors UserViewModal grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <AtSign className="text-cyan-400" size={18} />
                            <h3 className="font-semibold text-white">Account Information</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500">Username</p>
                                <p className="font-medium text-white">{user.username}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email Address</p>
                                <p className="font-medium text-white">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="text-emerald-400" size={18} />
                            <h3 className="font-semibold text-white">Organization</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500">Role</p>
                                <p className="font-medium text-white">{user.role.role_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Department</p>
                                <p className="font-medium text-white">{user.department.department_name}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Personal Information — mirrors UserViewModal 4-col grid */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <User size={18} className="text-blue-400" />
                        <h3 className="font-semibold text-white">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">First Name</p>
                            <p className="mt-1 text-white font-medium">{user.first_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Middle Name</p>
                            <p className="mt-1 text-white font-medium">{user.middle_name || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Last Name</p>
                            <p className="mt-1 text-white font-medium">{user.last_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Suffix</p>
                            <p className="mt-1 text-white font-medium">{user.suffix_name || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Created / Updated — mirrors UserViewModal date grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} className="text-cyan-400" />
                            <h3 className="font-semibold text-white">Created</h3>
                        </div>
                        <p className="text-gray-300">
                            {new Date(user.created_at).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} className="text-amber-400" />
                            <h3 className="font-semibold text-white">Updated</h3>
                        </div>
                        <p className="text-gray-300">
                            {new Date(user.updated_at).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>

                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-200">
                        Deleting this user will permanently remove their account and all related data. This cannot be recovered.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {!loadingDestroy && (
                        <CloseButton label="Cancel" onClose={onClose} />
                    )}
                    <SubmitButton
                        className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                        label="Delete User"
                        loading={loadingDestroy}
                        loadingLabel="Deleting..."
                    />
                </div>

            </form>
        </Modal>
    );
};

export default DeleteUserFormModal;