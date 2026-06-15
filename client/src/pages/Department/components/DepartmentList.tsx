
import { useEffect, useState, type FC } from "react";
import Spinner from "../../../components/Spinner/Spinner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table"
import DepartmentService from "../../../services/DepartmentService";
import { Link } from "react-router-dom";
import type { DepartmentsColumns } from "../../../interfaces/DepartmentInterface";

interface DepartmentListProps {
    refreshKey: boolean;
    onCountChange?: (count: number) => void;
    showToast: (message: string, isFailed?: boolean) => void;
}

const DepartmentList: FC<DepartmentListProps> = ({refreshKey, onCountChange, showToast}) => {
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [departments, setDepartments] = useState<DepartmentsColumns[]>([])

    const handleLoadDepartments = async () => {
        try {
            setLoadingDepartments(true)

            const res = await DepartmentService.loadDepartment()
            if (res.status === 200) {
                setDepartments(res.data.departments);

                onCountChange?.(res.data.departments.length);
            } else {
                console.error('Unexpected status error occured during load department: ', res.status)
            }
        } catch (error) {
            console.error('Unexpected server error occured during loading department: ', error)
        } finally {
            setLoadingDepartments(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await DepartmentService.destroyDepartment(id);

            showToast("Deleted successfully", false);
            handleLoadDepartments();
        } catch {
            showToast("Delete failed", true);
        }
    };

    useEffect(() => {
        handleLoadDepartments();
    }, [refreshKey]);
    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">
                
                {/* Table Header */}
                <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Departments
                        </h3>
                        <p className="text-sm text-gray-400">
                            Total: {departments.length} department(s)
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-gray-950 text-gray-300 text-xs uppercase tracking-wider">
                            <TableCell isHeader className="px-5 py-4 text-center">
                                No.
                            </TableCell>

                            <TableCell isHeader className="px-5 py-4 text-center">
                                Department
                            </TableCell>

                            <TableCell isHeader className="px-5 py-4 text-center">
                                Description
                            </TableCell>

                            <TableCell isHeader className="px-5 py-4 text-center">
                                Actions
                            </TableCell>
                        </TableHeader>

                        <TableBody className="text-sm">
                            {loadingDepartments ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10">
                                        <div className="flex justify-center">
                                            <Spinner size="md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : departments.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departments.map((department, index) => (
                                    <TableRow
                                        key={department.department_id}
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
                                            {department.department_name}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-center text-gray-400">
                                            {department.department_description || "-"}
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <div className="flex justify-center gap-3">
                                                <Link
                                                          to={`/departments/edit/${department.department_id}`}
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
                                                    to={`/departments/delete/${department.department_id}`}
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
        </>

    );
};

export default DepartmentList;