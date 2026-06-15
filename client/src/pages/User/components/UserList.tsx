import { useEffect, useState, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table";
import UserService from "../../../services/UserService";
import RoleService from "../../../services/RoleService";
import DepartmentService from "../../../services/DepartmentService";
import Spinner from "../../../components/Spinner/Spinner";
import type { UserColumns } from "../../../interfaces/UserInterface";
import type { RoleColumns } from "../../../interfaces/RoleInterface";
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Users,
    UserPlus,
    Search,
    FileDown,
    Shield,
    Building2,
    Filter,
    Eye,
    Pencil,
    Trash2,
    RefreshCw,
} from "lucide-react";

interface UserListProps {
    onAddUser: () => void;
    onEditUser: (user: UserColumns | null) => void;
    onDeleteUser: (user: UserColumns | null) => void;
    onViewUser: (user: UserColumns) => void;
    refreshKey: boolean;
}

const UserList: FC<UserListProps> = ({ onAddUser, onEditUser, onDeleteUser, onViewUser, refreshKey }) => {
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<UserColumns[]>([]);
    const [roles, setRoles] = useState<RoleColumns[]>([]);
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([]);

    // Filters
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleLoadUsers = async () => {
        try {
            setLoadingUsers(true);
            const res = await UserService.loadUsers();
            if (res.status === 200) setUsers(res.data.users);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleLoadRoles = async () => {
        try {
            const res = await RoleService.loadRoles();
            if (res.status === 200) setRoles(res.data.roles);
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    const handleLoadDepartments = async () => {
        try {
            const res = await DepartmentService.loadDepartment();
            if (res.status === 200) setDepartments(res.data.departments);
        } catch (error) {
            console.error("Error loading departments:", error);
        }
    };

    useEffect(() => {
        handleLoadUsers();
        handleLoadRoles();
        handleLoadDepartments();
    }, [refreshKey]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterRole, filterDepartment, filterDate]);

    const handleUserFullNameFormat = (user: UserColumns) => {
        let fullName = user.middle_name
            ? `${user.last_name}, ${user.first_name} ${user.middle_name.charAt(0)}.`
            : `${user.last_name}, ${user.first_name}`;
        if (user.suffix_name) fullName += ` ${user.suffix_name}`;
        return fullName;
    };

    const handleUserInitials = (user: UserColumns) => {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    };

    const getProfilePhotoUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_BACKEND_URL}${path}`;
    };

    // Filtered users
    const filteredUsers = users.filter((user) => {
        const fullName = handleUserFullNameFormat(user).toLowerCase();
        const matchesSearch = searchQuery === "" ||
            fullName.includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === "" ||
            user.role.role_id.toString() === filterRole;

        const matchesDepartment = filterDepartment === "" ||
            user.department.department_id.toString() === filterDepartment;

        const matchesDate = filterDate === "" ||
            new Date(user.created_at).toISOString().slice(0, 10) === filterDate;

        return matchesSearch && matchesRole && matchesDepartment && matchesDate;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleClearFilters = () => {
        setSearchInput("");
        setSearchQuery("");
        setFilterRole("");
        setFilterDepartment("");
        setFilterDate("");
    };

    const handleExportAllPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("User List", 105, 15, { align: "center" });

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleString("en-PH")}`, 14, 22);
        doc.setTextColor(0);

        autoTable(doc, {
            startY: 28,
            head: [["#", "Full Name", "Role", "Department", "Email", "Status", "Date Created"]],
            body: filteredUsers.map((user, index) => [
                index + 1,
                handleUserFullNameFormat(user),
                user.role.role_name,
                user.department.department_name,
                user.email,
                user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active",
                new Date(user.created_at).toLocaleDateString("en-PH"),
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [17, 24, 39] },
        });

        doc.save("users_list.pdf");
    };

    return (
        <div className="space-y-6">

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">

                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-500/10 p-3">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">
                                    User Management
                                </h1>
                                <p className="mt-1 text-gray-400">
                                    Manage users, departments, roles and system access.
                                </p>
                            </div>
                        </div>
                    </div>

                                    {/* RIGHT ACTION */}
                    <button
                        onClick={handleLoadUsers} 
                        className="
                            flex items-center gap-2
                            rounded-2xl
                            bg-blue-600
                            px-5 py-3
                            text-sm font-medium
                            text-white
                            transition-all
                            hover:bg-blue-500
                            hover:shadow-lg
                            hover:shadow-blue-500/25
                        "
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Users className="text-blue-400" />
                        <span className="text-3xl font-bold text-white">
                            {users.length}
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <p className="text-sm text-gray-400">Active Roles</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Shield className="text-emerald-400" />
                        <span className="text-3xl font-bold text-white">
                            {roles.length}
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl border border-purple-500/10 bg-purple-500/5 p-5">
                    <p className="text-sm text-gray-400">Departments</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Building2 className="text-purple-400" />
                        <span className="text-3xl font-bold text-white">
                            {departments.length}
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-5">
                    <p className="text-sm text-gray-400">Filtered Results</p>
                    <div className="mt-3 flex items-center gap-3">
                        <Filter className="text-cyan-400" />
                        <span className="text-3xl font-bold text-white">
                            {filteredUsers.length}
                        </span>
                    </div>
                </div>

            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-xl">

                {/* Search */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search name, email, username..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setSearchQuery(e.target.value);
                        }}
                        className="w-64 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                {/* Role Filter */}
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="rounded-2xl border border-white/10 focus:border-blue-400 bg-black/20 px-4 py-3 text-white [&>option]:bg-gray-900 [&>option]:text-white"
                >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                        </option>
                    ))}
                </select>

                {/* Department Filter */}
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="rounded-2xl border border-white/10 focus:border-blue-400 bg-black/20 px-4 py-3 text-white [&>option]:bg-gray-900 [&>option]:text-white"
                >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                        </option>
                    ))}
                </select>

                {/* Date Filter */}
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="                    rounded-2xl
                    border border-white/10
                    bg-black/20
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    focus:border-blue-500"
                />

                {/* Clear Filters */}
                {(searchQuery || filterRole || filterDepartment || filterDate) && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-sm text-gray-400 hover:text-white underline"
                    >
                        Clear Filters
                    </button>
                )}

                {/* Right Side Buttons */}
                <div className="ml-auto flex gap-3">
                    <button
                        type="button"
                        onClick={handleExportAllPDF}
                        className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-red-500"
                    >
                        <div className="flex items-center gap-2">
                            <FileDown size={16} />
                            Export PDF
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={onAddUser}
                        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500"
                    >
                        <div className="flex items-center gap-2">
                            <UserPlus size={16} />
                            Add User
                        </div>
                    </button>
                </div>

            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">

                <div className="max-w-full overflow-x-auto">
                    <Table>

                        <TableHeader className="sticky top-0 border-b border-white/10 bg-black/50 text-xs text-gray-300 backdrop-blur-xl">
                            <TableCell isHeader className="px-5 py-3 text-center">NO.</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-center">PROFILE</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start">FULL NAME</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start">ROLE</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start">DEPARTMENT</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start">EMAIL</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start">ACTIONS</TableCell>
                        </TableHeader>

                        <TableBody className="divide-y divide-white/5 text-sm text-gray-300">

                            {loadingUsers ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-10 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user, index) => (
                                    <TableRow
                                        key={user.user_id}
                                        className="hover:bg-white/[0.03] transition-colors"
                                    >
                                        <TableCell className="px-4 py-3 text-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-center">
                                            {user.profile_photo ? (
                                                <img
                                                    src={getProfilePhotoUrl(user.profile_photo)}
                                                    alt={handleUserInitials(user)}
                                                    className="w-10 h-10 rounded-full object-cover mx-auto"
                                                />
                                            ) : (
                                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                                                    {handleUserInitials(user)}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            {handleUserFullNameFormat(user)}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            {user.role.role_name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            {user.department.department_name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            {user.email}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewUser(user)}
                                                    className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onEditUser(user)}
                                                    className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteUser(user)}
                                                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}

                        </TableBody>

                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">

                        <p className="text-sm text-gray-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                        </p>

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-white/10 transition"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                        currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "border border-white/10 bg-black/20 text-white hover:bg-white/10"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-white/10 transition"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
};

export default UserList;