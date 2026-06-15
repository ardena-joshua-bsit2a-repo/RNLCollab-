import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import Modal from "../../../components/Modal"
import FloatingLabelSelect from "../../../components/Select/FloatingLabelselect"
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";
import { useEffect, useState, type FC, type FormEvent } from "react";
import RoleService from "../../../services/RoleService";
import DepartmentService from "../../../services/DepartmentService";
import UserService from "../../../services/UserService";
import type { UserFieldErrors } from "../../../interfaces/UserInterface";
import type { RoleColumns } from "../../../interfaces/RoleInterface";
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface";
import {
    User,
    Mail,
    Shield,
    Building2,
    Camera,
    Lock,
    AtSign,
    X,
} from "lucide-react";

interface AddUserFormModalProps {
    onUserAdded: (message: string) => void
    isOpen: boolean;
    onClose: () => void;
    refreshKey: () => void;
}

const AddUserFormModal: FC<AddUserFormModalProps> = ({ onUserAdded, isOpen, onClose, refreshKey }) => {
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [roles, setRoles] = useState<RoleColumns[]>([]);

    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([]);

    const [loadingStore, setLoadingStore] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffixName, setSuffixName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<UserFieldErrors>({});

    // ✅ Moved OUT of handleStoreUser — now a proper top-level handler
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setProfilePhoto(file);
        setProfilePhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);
        setProfilePhotoPreview(null);
    };

    const handleStoreUser = async (e: FormEvent) => {
        e.preventDefault()
        try {
            setLoadingStore(true)

            const payload = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                suffix_name: suffixName,
                role: role,
                department: department,
                email: email,
                username: username,
                password: password,
                password_confirmation: passwordConfirmation
            }

            const res = await UserService.storeUser(payload)

            if (res.status === 200) {
                // ✅ Upload photo after user is created, using returned user_id
                if (profilePhoto) {
                    await UserService.uploadProfilePhoto(res.data.user.user_id, profilePhoto);
                }

                onUserAdded(res.data.message)
                refreshKey();

                setFirstName('')
                setMiddleName('')
                setLastName('')
                setSuffixName('')
                setProfilePhoto(null)
                setProfilePhotoPreview(null)
                setRole('')
                setDepartment('')
                setEmail('')
                setUsername('')
                setPassword('')
                setPasswordConfirmation('')
                setErrors({})

                handleLoadRoles();
                refreshKey()
            } else {
                console.error('Unexpected error occured during adding user: ', res.status)
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                console.log('Unexpected server error occured during adding user: ', error)
            }
        } finally {
            setLoadingStore(false);
        }
    }

    const handleLoadRoles = async () => {
        try {
            setLoadingRoles(true);
            const res = await RoleService.loadRoles();
            if (res.status === 200) {
                setRoles(res.data.roles);
            }
        } catch (error) {
            console.error('Unexpected server error occured during loading roles: ', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleLoadDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const res = await DepartmentService.loadDepartment()
            if (res.status === 200) {
                setDepartments(res.data.departments)
            }
        } catch (error) {
            console.error('Unexpected server error occured during loading department: ', error)
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>

    <form onSubmit={handleStoreUser}>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 mb-6">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex items-center gap-4">

                <div className="rounded-2xl bg-blue-500/10 p-3">
                    <User className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Add User
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        Create a new system user and assign permissions.
                    </p>
                </div>

            </div>

        </div>

        {/* Profile Photo */}
        <div className="mb-8 flex flex-col items-center">

            <div className="relative">

                {profilePhotoPreview ? (
                    <>
                        <img
                            src={profilePhotoPreview}
                            alt="Preview"
                            className="h-28 w-28 rounded-full object-cover border-4 border-blue-500 shadow-lg shadow-blue-500/20"
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
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl font-bold text-white">
                        {firstName && lastName
                            ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                            : "?"}
                    </div>
                )}

                <label
                    htmlFor="profile_photo"
                    className="
                        absolute bottom-1 right-1
                        flex h-10 w-10 cursor-pointer items-center justify-center
                        rounded-full
                        bg-slate-900
                        border border-white/10
                        text-blue-400
                        transition-all
                        hover:bg-slate-800
                    "
                >
                    <Camera size={18} />
                </label>

                <input
                    id="profile_photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                />

            </div>

            <p className="mt-3 text-xs text-gray-500">
                Upload profile picture
            </p>

        </div>

        {/* Personal Information */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/40 p-5">

            <div className="mb-5 flex items-center gap-2">

                <User size={18} className="text-blue-400" />

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
                    autoFocus
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

        {/* Organization */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/40 p-5">

            <div className="mb-5 flex items-center gap-2">

                <Shield size={18} className="text-emerald-400" />

                <h2 className="font-semibold text-white">
                    Role & Department
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
                            <option value="">
                                Select Department
                            </option>

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

        {/* Account Information */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">

            <div className="mb-5 flex items-center gap-2">

                <Lock size={18} className="text-amber-400" />

                <h2 className="font-semibold text-white">
                    Account Information
                </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FloatingLabelInput
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    errors={errors.email}
                    required
                />

                <FloatingLabelInput
                    label="Username"
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    errors={errors.username}
                    required
                />

                <FloatingLabelInput
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    errors={errors.password}
                    required
                />

                <FloatingLabelInput
                    label="Confirm Password"
                    type="password"
                    name="password_confirmation"
                    value={passwordConfirmation}
                    onChange={(e) =>
                        setPasswordConfirmation(e.target.value)
                    }
                    errors={errors.password_confirmation}
                    required
                />

            </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">

            {!loadingStore && (
                <CloseButton
                    label="Cancel"
                    onClose={onClose}
                />
            )}

            <SubmitButton
                label="Create User"
                loading={loadingStore}
                loadingLabel="Creating User..."
            />

        </div>

    </form>

</Modal>
    )
}

export default AddUserFormModal