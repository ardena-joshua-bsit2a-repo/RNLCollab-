import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";

import {
    FiHome, FiUsers, FiCalendar, FiTrash2,
    FiActivity, FiBarChart2, FiMapPin, FiShield, FiChevronDown,
} from "react-icons/fi";

// ── Tooltip for icon-only collapsed mode ──────────────────────────────────────
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="relative group/tip w-full">
        {children}
        <div className="
            pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[99]
            whitespace-nowrap rounded-xl border border-white/10 bg-slate-900
            px-3 py-2 text-xs font-medium text-slate-100 shadow-2xl
            opacity-0 translate-x-[-6px]
            group-hover/tip:opacity-100 group-hover/tip:translate-x-0
            transition-all duration-150
        ">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900" />
        </div>
    </div>
);

interface NavChild { text: string; path: string; icon: React.ReactNode; }
interface NavItem  { text: string; icon: React.ReactNode; path?: string; children?: NavChild[]; }

const AppSidebar = () => {
    const { isOpen } = useSidebar();
    const { user, isSuperAdmin } = useAuth();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        "Event Management": true,
    });

    const toggleMenu = (menu: string) =>
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

    const sidebarItems: NavItem[] = [
        { text: "Dashboard", path: "/", icon: <FiHome /> },

        ...(isSuperAdmin ? [{
            text: "User Management",
            icon: <FiUsers />,
            children: [
                { text: "Roles & Permissions", path: "/roles-permissions", icon: <FiShield /> },
                { text: "Department / Office",  path: "/departments",       icon: <FiUsers /> },
                { text: "All Users",            path: "/users",             icon: <FiUsers /> },
            ],
        }] : []),

        {
            text: "Event Management",
            icon: <FiCalendar />,
            children: [
                ...(isSuperAdmin ? [{ text: "Event Venue", path: "/venue", icon: <FiMapPin /> }] : []),
                { text: "All Events",      path: "/events",          icon: <FiCalendar /> },
                ...(isSuperAdmin ? [{ text: "Event Approvals", path: "/event-approval", icon: <FiShield /> }] : []),
            ],
        },

        {
            text: "Trash",
            icon: <FiTrash2 />,
            children: [
                ...(isSuperAdmin ? [
                    { text: "User Trash",  path: "/user-trash",  icon: <FiTrash2 /> },
                    { text: "Event Trash", path: "/event-trash", icon: <FiTrash2 /> },
                ] : []),
            ],
        },

        ...(isSuperAdmin ? [
            { text: "Activity Logs",       path: "/logs",    icon: <FiActivity />  },
            { text: "Reports & Analytics", path: "/reports", icon: <FiBarChart2 /> },
        ] : []),
    ].filter((item): item is NavItem => !item.children || item.children.length > 0);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 sm:hidden" />
            )}

            <aside className={`
                fixed top-0 left-0 z-40 h-screen
                bg-slate-950 border-r border-slate-800 shadow-2xl
                flex flex-col
                transition-[width] duration-300 ease-in-out overflow-hidden
                ${isOpen ? "w-64" : "w-0 sm:w-[68px]"}
            `}>

                {/* Spacer to sit below the fixed header (h-[73px]) */}
                <div className="h-[73px] shrink-0 border-b border-slate-800" />

                {/* ── Nav ── */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
                    {sidebarItems.map((item, i) => (
                        <div key={i}>

                            {/* ── Single link ── */}
                            {!item.children && (
                                isOpen ? (
                                    <NavLink
                                        to={item.path!}
                                        end={item.path === "/"}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                            transition-all duration-200
                                            ${isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                                                : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}
                                        `}
                                    >
                                        <span className="text-base shrink-0">{item.icon}</span>
                                        <span className="whitespace-nowrap">{item.text}</span>
                                    </NavLink>
                                ) : (
                                    <Tooltip label={item.text}>
                                        <NavLink
                                            to={item.path!}
                                            end={item.path === "/"}
                                            className={({ isActive }) => `
                                                flex items-center justify-center w-full py-2.5 rounded-xl text-base
                                                transition-all duration-200
                                                ${isActive
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                                                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}
                                            `}
                                        >
                                            {item.icon}
                                        </NavLink>
                                    </Tooltip>
                                )
                            )}

                            {/* ── Dropdown ── */}
                            {item.children && (
                                isOpen ? (
                                    // EXPANDED: full dropdown with label + children
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.text)}
                                            className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-base shrink-0">{item.icon}</span>
                                                <span className="whitespace-nowrap">{item.text}</span>
                                            </div>
                                            <FiChevronDown
                                                size={13}
                                                className={`shrink-0 transition-transform duration-300 ${openMenus[item.text] ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ${openMenus[item.text] ? "max-h-60" : "max-h-0"}`}>
                                            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-800 pl-3 pb-1">
                                                {item.children.map((child, ci) => (
                                                    <NavLink
                                                        key={ci}
                                                        to={child.path}
                                                        className={({ isActive }) => `
                                                            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                                            transition-all duration-200
                                                            ${isActive
                                                                ? "bg-indigo-500/15 text-indigo-400 font-medium"
                                                                : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}
                                                        `}
                                                    >
                                                        <span className="text-sm shrink-0">{child.icon}</span>
                                                        <span className="whitespace-nowrap">{child.text}</span>
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // COLLAPSED: parent icon as a visual divider, then each child as its own icon link
                                    <div className="space-y-0.5">
                                        {/* Parent icon — not clickable, just a visual group separator */}
                                        <Tooltip label={item.text}>
                                            <div className="flex w-full items-center justify-center py-2 rounded-xl text-base text-slate-600 cursor-default select-none">
                                                {item.icon}
                                            </div>
                                        </Tooltip>

                                        {/* Each child gets its own icon + tooltip so it's fully clickable */}
                                        {item.children.map((child, ci) => (
                                            <Tooltip key={ci} label={child.text}>
                                                <NavLink
                                                    to={child.path}
                                                    className={({ isActive }) => `
                                                        flex items-center justify-center w-full py-2.5 rounded-xl text-base
                                                        transition-all duration-200
                                                        ${isActive
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                                                            : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}
                                                    `}
                                                >
                                                    {child.icon}
                                                </NavLink>
                                            </Tooltip>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </nav>

                {/* ── Footer ── */}
                <div className="border-t border-slate-800 shrink-0 p-3">
                    {isOpen ? (
                        <div className="rounded-xl bg-slate-900 px-3 py-2.5">
                            <p className="text-[10px] text-slate-500 whitespace-nowrap">
                                Event Management System
                            </p>
                            <p className="text-xs font-semibold text-white mt-0.5 whitespace-nowrap">
                                {user?.role?.role_name || "Guest"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                                {user?.first_name} {user?.last_name}
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center py-1">
                            <div className={`h-2 w-2 rounded-full shadow-lg ${
                                isSuperAdmin
                                    ? "bg-indigo-500 shadow-indigo-500/50"
                                    : "bg-emerald-500 shadow-emerald-500/50"
                            }`} />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default AppSidebar;