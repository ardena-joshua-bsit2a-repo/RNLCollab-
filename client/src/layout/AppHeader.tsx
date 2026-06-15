import { useNavigate } from "react-router-dom";
import { useHeader } from "../contexts/HeaderContext";
import { useSidebar } from "../contexts/SidebarContext";
import { getUserDisplayName, useAuth } from "../contexts/AuthContext";
import { FiMenu, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import NotificationBell from "../pages/NotificationBell/components/NotificationBell";

const AppHeader = () => {
    const { isOpen, toggleUserMenu } = useHeader();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const initials =
        getUserDisplayName(user)
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";

    // Reusable avatar components
    const SmallAvatar = () => user?.profile_photo ? (
        <img
            src={`${backendUrl}${user.profile_photo}`}
            alt="Avatar"
            className="h-9 w-9 rounded-full object-cover border border-slate-700 shrink-0"
        />
    ) : (
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
        </div>
    );

    const LargeAvatar = () => user?.profile_photo ? (
        <img
            src={`${backendUrl}${user.profile_photo}`}
            alt="Avatar"
            className="h-11 w-11 rounded-full object-cover border border-slate-700 shrink-0"
        />
    ) : (
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shrink-0">
            {initials}
        </div>
    );

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={toggleUserMenu} />
            )}

            <header className="fixed top-0 left-0 right-0 z-50 h-[73px] bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
                <div className="h-full px-4 lg:px-6">
                    <div className="flex items-center justify-between h-full">

                        {/* ── Left ── */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSidebar}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                                aria-label="Toggle sidebar"
                            >
                                <FiMenu size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    F
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-white font-bold text-base leading-none">FilSched</h1>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Event Management System</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Right ── */}
                        <div className="flex items-center gap-2">

                            <NotificationBell />

                            {/* User menu */}
                            <div className="relative z-50">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-800 transition"
                                >
                                    {/* Small avatar in header button */}
                                    <SmallAvatar />
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-white leading-none">{getUserDisplayName(user) || "User"}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{user?.role?.role_name || "User"}</p>
                                    </div>
                                    <FiChevronDown
                                        size={14}
                                        className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Dropdown */}
                                <div className={`
                                    absolute right-0 top-[52px] w-72
                                    rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl
                                    transition-all duration-200
                                    ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"}
                                `}>
                                    <div className="p-4 border-b border-slate-800">
                                        <div className="flex items-center gap-3">
                                            {/* Large avatar in dropdown */}
                                            <LargeAvatar />
                                            <div>
                                                <p className="font-medium text-white text-sm">{getUserDisplayName(user)}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { navigate("/profile"); toggleUserMenu(); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition"
                                        >
                                            <FiUser size={15} /> Profile
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
                                        >
                                            <FiLogOut size={15} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default AppHeader;