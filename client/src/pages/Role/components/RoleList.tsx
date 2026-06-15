import { useEffect, useState, type FC } from "react";
import Spinner from "../../../components/Spinner/Spinner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table";
import RoleService from "../../../services/RoleService";
import { Link } from "react-router-dom";
import type { RoleColumns } from "../../../interfaces/RoleInterface";

interface RoleListProps {
    refreshKey: boolean;
    onCountChange?: (count: number) => void;
    showToast?: (message: string, isFailed?: boolean) => void;
}

const RoleList: FC<RoleListProps> = ({
    refreshKey,
    onCountChange,
    showToast,
}) => {
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [roles, setRoles] = useState<RoleColumns[]>([]);

    const handleLoadRoles = async () => {
        try {
            setLoadingRoles(true);

            const res = await RoleService.loadRoles();

            if (res.status === 200) {
                setRoles(res.data.roles);

                onCountChange?.(res.data.roles.length);
            } else {
                console.error(
                    "Unexpected status error occured during load roles:",
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected server error occured during loading roles:",
                error
            );
        } finally {
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        handleLoadRoles();
    }, [refreshKey]);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Roles
                    </h3>

                    <p className="text-sm text-gray-400">
                        Total: {roles.length} role(s)
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-gray-950 text-gray-300 text-xs uppercase tracking-wider">
                        <TableCell isHeader className="px-5 py-4 text-center">
                            No.
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Role
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Description
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Actions
                        </TableCell>
                    </TableHeader>

                    <TableBody className="text-sm">
                        {loadingRoles ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-10">
                                    <div className="flex justify-center">
                                        <Spinner size="md" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-10 text-center text-gray-500"
                                >
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role, index) => (
                                <TableRow
                                    key={role.role_id}
                                    className="
                                        border-t border-gray-800
                                        hover:bg-gray-800/50
                                        transition-colors
                                    "
                                >
                                    <TableCell className="px-5 py-4 text-center text-gray-300">
                                        {index + 1}
                                    </TableCell>

                                    <TableCell className="px-5 py-4 text-center font-medium text-white">
                                        {role.role_name}
                                    </TableCell>

                                    <TableCell className="px-5 py-4 text-center text-gray-400">
                                        {role.role_description || "-"}
                                    </TableCell>

                                    <TableCell className="px-5 py-4">
                                        <div className="flex justify-center gap-3">
                                            <Link
                                                to={`/roles-permissions/edit/${role.role_id}`}
                                                className="
                                                    rounded-lg
                                                    bg-blue-500/10
                                                    px-3 py-1.5
                                                    text-sm
                                                    font-medium
                                                    text-blue-400
                                                    hover:bg-blue-500/20
                                                "
                                            >
                                                Edit
                                            </Link>

                                            <Link
                                                to={`/roles-permissions/delete/${role.role_id}`}
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
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default RoleList;