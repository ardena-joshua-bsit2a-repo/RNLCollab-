import type { FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/Button/CloseButton";
import type { UserColumns } from "../../../interfaces/UserInterface";
import jsPDF from "jspdf";
import {
    User,
    Mail,
    Shield,
    Building2,
    Calendar,
    Download,
    CircleCheck,
    CircleX,
    AtSign,
} from "lucide-react";

interface UserViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserColumns | null;
}

const UserViewModal: FC<UserViewModalProps> = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    const getProfilePhotoUrl = (path: string) => {
        return `${import.meta.env.VITE_BACKEND_URL}${path}`;
    };

    const getInitials = () => {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    };

    const getFullName = () => {
        let fullName = user.middle_name
            ? `${user.last_name}, ${user.first_name} ${user.middle_name.charAt(0)}.`
            : `${user.last_name}, ${user.first_name}`;
        if (user.suffix_name) fullName += ` ${user.suffix_name}`;
        return fullName;
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("User Details", 105, 20, { align: "center" });

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 28, 196, 28);

        const fields = [
            ["Full Name", getFullName()],
            ["Username", user.username],
            ["Email", user.email],
            ["Role", user.role.role_name],
            ["Department", user.department.department_name],
            ["Status", user.status.charAt(0).toUpperCase() + user.status.slice(1)],
            ["Created At", new Date(user.created_at).toLocaleDateString("en-PH", {
                year: "numeric", month: "long", day: "numeric"
            })],
        ];

        let y = 40;
        fields.forEach(([label, value]) => {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(80, 80, 80);
            doc.text(`${label}:`, 14, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 30, 30);
            doc.text(value ?? "—", 60, y);

            y += 12;
        });

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleString("en-PH")}`, 14, 285);

        doc.save(`${user.username}_details.pdf`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>

    <div className="space-y-6">

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex items-center gap-4">

                <div className="rounded-2xl bg-blue-500/10 p-3">
                    <User className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        User Profile
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        Complete information and account details.
                    </p>
                </div>

            </div>

        </div>

        {/* Profile Section */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">

            <div className="flex flex-col items-center">

                {user.profile_photo ? (
                    <img
                        src={getProfilePhotoUrl(user.profile_photo)}
                        alt={getInitials()}
                        className="
                            h-28 w-28 rounded-full object-cover
                            border-4 border-blue-500
                            shadow-lg shadow-blue-500/20
                        "
                    />
                ) : (
                    <div
                        className="
                            flex h-28 w-28 items-center justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-blue-500
                            to-cyan-500
                            text-3xl font-bold text-white
                        "
                    >
                        {getInitials()}
                    </div>
                )}

                <h2 className="mt-4 text-xl font-bold text-white">
                    {getFullName()}
                </h2>

                <p className="text-gray-400">
                    @{user.username}
                </p>

                <div className="mt-3">

                    {(user.status ?? "active") === "active" ? (
                        <span
                            className="
                                inline-flex items-center gap-2
                                rounded-full
                                border border-emerald-500/20
                                bg-emerald-500/10
                                px-4 py-1
                                text-xs font-medium text-emerald-400
                            "
                        >
                            <CircleCheck size={14} />
                            ACTIVE
                        </span>
                    ) : (
                        <span
                            className="
                                inline-flex items-center gap-2
                                rounded-full
                                border border-red-500/20
                                bg-red-500/10
                                px-4 py-1
                                text-xs font-medium text-red-400
                            "
                        >
                            <CircleX size={14} />
                            INACTIVE
                        </span>
                    )}

                </div>

            </div>

        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Account Information */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">

                <div className="mb-4 flex items-center gap-2">
                    <AtSign className="text-cyan-400" size={18} />
                    <h3 className="font-semibold text-white">
                        Account Information
                    </h3>
                </div>

                <div className="space-y-4 text-sm">

                    <div>
                        <p className="text-gray-500">
                            Username
                        </p>
                        <p className="font-medium text-white">
                            {user.username}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Email Address
                        </p>
                        <p className="font-medium text-white">
                            {user.email}
                        </p>
                    </div>

                </div>

            </div>

            {/* Organization */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">

                <div className="mb-4 flex items-center gap-2">
                    <Shield className="text-emerald-400" size={18} />
                    <h3 className="font-semibold text-white">
                        Organization
                    </h3>
                </div>

                <div className="space-y-4 text-sm">

                    <div>
                        <p className="text-gray-500">
                            Role
                        </p>

                        <p className="font-medium text-white">
                            {user.role.role_name}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Department
                        </p>

                        <p className="font-medium text-white">
                            {user.department.department_name}
                        </p>
                    </div>

                </div>

            </div>

        </div>

        {/* Personal Information */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">

            <div className="mb-5 flex items-center gap-2">
                <User size={18} className="text-blue-400" />
                <h3 className="font-semibold text-white">
                    Personal Information
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                <div>
                    <p className="text-xs text-gray-500 uppercase">
                        First Name
                    </p>

                    <p className="mt-1 text-white font-medium">
                        {user.first_name}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 uppercase">
                        Middle Name
                    </p>

                    <p className="mt-1 text-white font-medium">
                        {user.middle_name || "—"}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 uppercase">
                        Last Name
                    </p>

                    <p className="mt-1 text-white font-medium">
                        {user.last_name}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 uppercase">
                        Suffix
                    </p>

                    <p className="mt-1 text-white font-medium">
                        {user.suffix_name || "—"}
                    </p>
                </div>

            </div>

        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">

                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-cyan-400" />
                    <h3 className="font-semibold text-white">
                        Created
                    </h3>
                </div>

                <p className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString(
                        "en-PH",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}
                </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">

                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-amber-400" />
                    <h3 className="font-semibold text-white">
                        Updated
                    </h3>
                </div>

                <p className="text-gray-300">
                    {new Date(user.updated_at).toLocaleDateString(
                        "en-PH",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}
                </p>

            </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/5 pt-6">

            <CloseButton
                label="Close"
                onClose={onClose}
            />

            <button
                type="button"
                onClick={handleExportPDF}
                className="
                    flex items-center gap-2
                    rounded-2xl
                    bg-red-600
                    px-5 py-3
                    text-sm font-medium
                    text-white
                    transition-all
                    hover:bg-red-500
                    hover:shadow-lg
                    hover:shadow-red-500/25
                "
            >
                <Download size={16} />
                Export PDF
            </button>

        </div>

    </div>

</Modal>
    );
};

export default UserViewModal;