import BackButton from "../../../components/Button/BackButton"
import SubmitButton from "../../../components/Button/SubmitButton"
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState, type FormEvent } from "react"
import Spinner from "../../../components/Spinner/Spinner"
import DepartmentService from "../../../services/DepartmentService"


const DeleteDepartmentForm = () => {
    const [loadingGet, setLoadingGet] = useState(false)
    const [loadingDestroy, setLoadingDestroy] = useState(false)
    const [department, setdepartment] = useState("")
    const [description, setDescription] = useState("");

    const { department_id } = useParams()
    const navigate = useNavigate()

    const handleGetDepartment = async (department_id: string | number) => {
        try {
            setLoadingGet(true);

            const res = await DepartmentService.getDepartment(department_id);

            if (res.status === 200) {
                setdepartment(res.data.department.department_name)
                setDescription(res.data.department.department_description || "")
            } else {
                console.error('Unexpected status error occured during deleting department: ', res.status)
            }
        } catch (error) {
            {
                console.error('Unexpected server error occured during deleting department: ', error)
            };
        } finally {
            setLoadingGet(false)
        }
    };

    const handleDestroyDepartment = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setLoadingDestroy(true)

            const res = await DepartmentService.destroyDepartment(department_id!)

            if (res.status === 200) {
                navigate('/departments', { state: { message: res.data.message } })
            } else {
                console.error('Unexpected status error occured during deleting department: ', res.status);
            };
        } catch (error) {
            console.error('Unexpected server error occured during deleting department: ', error);
        } finally {
            setLoadingDestroy(false);
        }
    }

    useEffect(() => {
        if (department_id) {
            const parsedDepartmentId = parseInt(department_id);
            handleGetDepartment(parsedDepartmentId)
        } else {
            console.error('Unexpected parameter error occured during getting: ', department_id)
        }
    }, [department_id]);

    return (
        <div className="max-w-2xl mx-auto mt-10">

            {/* Loading State */}
            {loadingGet ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className="border-b border-gray-800 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Delete Department
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleDestroyDepartment} className="p-6 space-y-5">

                        {/* Warning Box */}
                        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                            ⚠️ You are about to permanently delete this department.
                        </div>

                        {/* Department Info */}
                        <div className="space-y-4">

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Department Name</p>
                                <p className="text-white font-semibold">
                                    {department}
                                </p>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Description</p>
                                <p className="text-gray-300">
                                    {description || "No description provided"}
                                </p>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-2 border-t border-gray-800">

                            <BackButton label="Cancel" path="/departments" />

                            <SubmitButton
                                label="Delete Department"
                                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400  hover:bg-red-500/20"
                                loading={loadingDestroy}
                                loadingLabel="Deleting..."
                            />

                        </div>

                    </form>
                </div>
            )}
        </div>
    );
};

export default DeleteDepartmentForm;