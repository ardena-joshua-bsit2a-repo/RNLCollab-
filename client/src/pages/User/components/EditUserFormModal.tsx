import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelselect";
import CloseButton from "../../../components/Button/CloseButton";
import SubmitButton from "../../../components/Button/SubmitButton";

import RoleService from "../../../services/RoleService";
import DepartmentService from "../../../services/DepartmentService";
import UserService from "../../../services/UserService";

import type { UserColumns, UserFieldErrors } from "../../../interfaces/UserInterface";
import type { RoleColumns } from "../../../interfaces/RoleInterface";
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface";

import { User, Shield, Camera, X, Pencil, Mail } from "lucide-react";

interface EditUserFormModalProps {
    user: UserColumns | null;
    onUserUpdated: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const EditUserFormModal: FC<EditUserFormModalProps> = ({
    user,
    onUserUpdated,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [roles, setRoles] = useState<RoleColumns[]>([]);

    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([]);

    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffixName, setSuffixName] = useState("");

    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");

    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const [errors, setErrors] = useState<UserFieldErrors>({});

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setProfilePhoto(file);
        setProfilePhotoPreview(file ? URL.createObjectURL(file) : null);
        setRemovePhoto(false);
    };

    const handleRemovePhoto = async () => {
        setProfilePhoto(null);
        setProfilePhotoPreview(null);
        setRemovePhoto(true);
    };

    const handleUpdateUser = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setLoadingUpdate(true);

            const payload = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                suffix_name: suffixName,
                role,
                department,
                email,
                username,
                remove_photo: removePhoto,
            };

            const res = await UserService.updateUser(user?.user_id!, payload);

            if (res.status === 200) {
                if (profilePhoto) {
                    await UserService.uploadProfilePhoto(user?.user_id!, profilePhoto);
                }

                if (removePhoto) {
                    await UserService.removeProfilePhoto(user?.user_id!);
                }

                onUserUpdated(res.data.message);
                refreshKey();
                onClose();
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
            }
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleLoadRoles = async () => {
        try {
            setLoadingRoles(true);
            const res = await RoleService.loadRoles();
            if (res.status === 200) setRoles(res.data.roles);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleLoadDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const res = await DepartmentService.loadDepartment();
            if (res.status === 200) setDepartments(res.data.departments);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDepartments(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleLoadRoles();
            handleLoadDepartments();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && user) {
            setFirstName(user.first_name);
            setMiddleName(user.middle_name ?? "");
            setLastName(user.last_name);
            setSuffixName(user.suffix_name ?? "");
            setRole(user.role.role_id.toString());
            setDepartment(user.department.department_id.toString());
            setEmail(user.email);
            setUsername(user.username);

            setProfilePhotoPreview(
                user.profile_photo
                    ? `${import.meta.env.VITE_BACKEND_URL}${user.profile_photo}`
                    : null
            );

            setProfilePhoto(null);
            setRemovePhoto(false);
        }
    }, [isOpen, user]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleUpdateUser} className="space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">

                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="rounded-2xl bg-emerald-500/10 p-3">
                            <Pencil className="h-6 w-6 text-emerald-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Edit User
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Update user information, role assignment and profile settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">

                    <div className="relative">

                        {profilePhotoPreview ? (
                            <>
                                <img
                                    src={profilePhotoPreview}
                                    alt="Preview"
                                    className="h-28 w-28 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                                />

                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-3xl font-bold text-white">
                                {firstName && lastName
                                    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                                    : "?"}
                            </div>
                        )}

                        <label
                            htmlFor="edit_profile_photo"
                            className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-800 shadow-lg"
                        >
                            <Camera size={16} />
                        </label>

                        <input
                            id="edit_profile_photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    <p className="mt-3 text-sm text-gray-400">
                        Change profile picture
                    </p>
                </div>

                {/* PERSONAL INFORMATION */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">

                    <div className="mb-5 flex items-center gap-2">
                        <User size={18} className="text-emerald-400" />
                        <h2 className="font-semibold text-white">
                            Personal Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingLabelInput
                            label="First Name"
                            type="text"
                            name="first_name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            errors={errors.first_name}
                            required
                        />

                        <FloatingLabelInput
                            label="Middle Name"
                            type="text"
                            name="middle_name"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            errors={errors.middle_name}
                        />

                        <FloatingLabelInput
                            label="Last Name"
                            type="text"
                            name="last_name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            errors={errors.last_name}
                            required
                        />

                        <FloatingLabelInput
                            label="Suffix Name"
                            type="text"
                            name="suffix_name"
                            value={suffixName}
                            onChange={(e) => setSuffixName(e.target.value)}
                            errors={errors.suffix_name}
                        />

                    </div>
                </div>

                {/* ROLE & DEPARTMENT */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">

                    <div className="mb-5 flex items-center gap-2">
                        <Shield size={18} className="text-cyan-400" />
                        <h2 className="font-semibold text-white">
                            Access Configuration
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingLabelSelect
                            label="Role"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            errors={errors.role}
                        >
                            {loadingRoles ? (
                                <option>Loading...</option>
                            ) : (
                                <>
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option
                                            key={role.role_id}
                                            value={role.role_id}
                                        >
                                            {role.role_name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </FloatingLabelSelect>

                        <FloatingLabelSelect
                            label="Department"
                            name="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            errors={errors.department}
                        >
                            {loadingDepartments ? (
                                <option>Loading...</option>
                            ) : (
                                <>
                                    <option value="">Select Department</option>
                                    {departments.map((department) => (
                                        <option
                                            key={department.department_id}
                                            value={department.department_id}
                                        >
                                            {department.department_name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </FloatingLabelSelect>

                    </div>
                </div>

                {/* ACCOUNT INFORMATION (FIXED STRUCTURE) */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">

                    <div className="mb-5 flex items-center gap-2">
                        <Mail size={18} className="text-amber-400" />
                        <h2 className="font-semibold text-white">
                            Account Information
                        </h2>
                    </div>

                    {/* 🔥 FIX: EMAIL + USERNAME PROPER GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingLabelInput
                            label="Email"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            errors={errors.email}
                        />

                        <FloatingLabelInput
                            label="Username"
                            type="text"
                            name="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            errors={errors.username}
                        />

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">

                    {!loadingUpdate && (
                        <CloseButton label="Close" onClose={onClose} />
                    )}

                    <SubmitButton
                        label="Update User"
                        loading={loadingUpdate}
                        loadingLabel="Updating User..."
                    />
                </div>

            </form>
        </Modal>
    );
};

export default EditUserFormModal;