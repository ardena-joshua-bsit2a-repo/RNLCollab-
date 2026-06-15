import { useEffect, useRef, useState } from "react"
import { useAuth, getUserDisplayName } from "../../contexts/AuthContext"
import UserService from "../../services/UserService"
import { FiCamera, FiTrash2, FiSave, FiLock, FiUser, FiArrowLeft } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

const ProfilePage = () => {
    const { user, refreshUser } = useAuth()
    const fileRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const [form, setForm] = useState({
        first_name:   "",
        middle_name:  "",
        last_name:    "",
        suffix_name:  "",
        email:        "",
        username:     "",
    })
    const [passwords, setPasswords] = useState({
        current_password:          "",
        new_password:              "",
        new_password_confirmation: "",
    })
    const [saving, setSaving]             = useState(false)
    const [photoLoading, setPhotoLoading] = useState(false)
    const [toast, setToast]               = useState<{ message: string; type: "success" | "error" } | null>(null)

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    useEffect(() => {
        if (!user) return
        setForm({
            first_name:  user.first_name  ?? "",
            middle_name: user.middle_name ?? "",
            last_name:   user.last_name   ?? "",
            suffix_name: user.suffix_name ?? "",
            email:       user.email       ?? "",
            username:    user.username    ?? "",
        })
    }, [user])

    const handleSave = async () => {
        setSaving(true)
        try {
            await UserService.updateProfile({
                ...form,
                ...(passwords.new_password ? passwords : {}),
            })
            await refreshUser()
            showToast("Profile updated successfully.", "success")
            setPasswords({ current_password: "", new_password: "", new_password_confirmation: "" })
        } catch (err: any) {
            showToast(err?.response?.data?.message ?? "Failed to update profile.", "error")
        } finally {
            setSaving(false)
        }
    }

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return
        setPhotoLoading(true)
        try {
            await UserService.uploadProfilePhoto(user.user_id, file)
            await refreshUser()
            showToast("Profile photo updated.", "success")
        } catch {
            showToast("Failed to upload photo.", "error")
        } finally {
            setPhotoLoading(false)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    const handleRemovePhoto = async () => {
        if (!user) return
        setPhotoLoading(true)
        try {
            await UserService.removeProfilePhoto(user.user_id)
            await refreshUser()
            showToast("Profile photo removed.", "success")
        } catch (err: any) {
            showToast(
                err?.response?.data?.message ?? "Failed to remove profile photo.",
                "error"
            )
        } finally {
            setPhotoLoading(false)
        }
    }

    const initials = getUserDisplayName(user)
        ?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"

    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? ""

    return (
        <>
            {/* Fixed Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 transition-all
                    ${toast.type === "success"
                        ? "bg-green-500/20 border border-green-500/40 text-green-400"
                        : "bg-red-500/20 border border-red-500/40 text-red-400"
                    }`}
                >
                    {toast.type === "success" ? "✅" : "❌"} {toast.message}
                </div>
            )}

            {/* Page */}
            <div className="min-h-screen bg-slate-950 px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-2"
                    >
                        <FiArrowLeft size={16} /> Back
                    </button>

                    {/* Avatar Card */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center gap-5">
                        <div className="relative shrink-0">
                            {user?.profile_photo ? (
                                <img
                                    src={`${backendUrl}${user.profile_photo}`}
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-slate-700"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl">
                                    {initials}
                                </div>
                            )}
                            {photoLoading && (
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-lg leading-none">{getUserDisplayName(user)}</p>
                            <p className="text-slate-400 text-sm mt-1">{user?.role?.role_name} · {user?.department?.department_name}</p>
                            <div className="flex gap-2 mt-3">
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={photoLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition disabled:opacity-50"
                                >
                                    <FiCamera size={13} /> Change Photo
                                </button>
                                {user?.profile_photo && (
                                    <button
                                        onClick={handleRemovePhoto}
                                        disabled={photoLoading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-red-600/20 text-red-400 text-xs rounded-lg transition disabled:opacity-50"
                                    >
                                        <FiTrash2 size={13} /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FiUser size={16} className="text-indigo-400" />
                            <h2 className="text-white font-semibold">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "First Name",  key: "first_name",  required: true },
                                { label: "Middle Name", key: "middle_name", required: false },
                                { label: "Last Name",   key: "last_name",   required: true },
                                { label: "Suffix",      key: "suffix_name", required: false },
                            ].map(({ label, key, required }) => (
                                <div key={key} className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400">{label}{required && " *"}</label>
                                    <input
                                        type="text"
                                        value={(form as any)[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Email",    key: "email",    type: "email" },
                                { label: "Username", key: "username", type: "text" },
                            ].map(({ label, key, type }) => (
                                <div key={key} className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400">{label} *</label>
                                    <input
                                        type={type}
                                        value={(form as any)[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400">Role</label>
                                <input type="text" value={user?.role?.role_name ?? ""} readOnly
                                    className="bg-slate-800/40 border border-slate-700 text-slate-500 text-sm rounded-lg px-3 py-2 cursor-not-allowed" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400">Department</label>
                                <input type="text" value={user?.department?.department_name ?? ""} readOnly
                                    className="bg-slate-800/40 border border-slate-700 text-slate-500 text-sm rounded-lg px-3 py-2 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FiLock size={16} className="text-indigo-400" />
                            <h2 className="text-white font-semibold">Change Password</h2>
                            <span className="text-xs text-slate-500">(leave blank to keep current)</span>
                        </div>
                        {[
                            { label: "Current Password",     key: "current_password" },
                            { label: "New Password",          key: "new_password" },
                            { label: "Confirm New Password",  key: "new_password_confirmation" },
                        ].map(({ label, key }) => (
                            <div key={key} className="flex flex-col gap-1">
                                <label className="text-xs text-slate-400">{label}</label>
                                <input
                                    type="password"
                                    value={(passwords as any)[key]}
                                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Save */}
                    <div className="flex justify-end pb-8">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                        >
                            <FiSave size={15} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}

export default ProfilePage