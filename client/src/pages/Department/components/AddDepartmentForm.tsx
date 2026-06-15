import { useState, type FC, type FormEvent } from "react"
import SubmitButton from "../../../components/Button/SubmitButton"
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import DepartmentService from "../../../services/DepartmentService";
import type { DepartmentFieldErrors } from "../../../interfaces/DepartmentInterface";

interface AddDepartmentFormProps {
    onDepartmentAdded: (message: string) => void
    refreshKey: () => void

}

const AddDepartmentForm: FC<AddDepartmentFormProps> = ({
    onDepartmentAdded,
    refreshKey,
}) => {
    const [loadingStore, setLoadingStore] = useState(false)
    const [departmentName, setdepartmentName] = useState('')
    const [description, setDescription] = useState('')
    const [errors, setErrors] = useState<DepartmentFieldErrors>({});

    const handleStoreDepartment = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setLoadingStore(true)

            const res = await DepartmentService.storeDepartment({ department_name: departmentName, department_description: description })

            if (res.status === 200) {
                setdepartmentName("");
                setDescription("");
                setErrors({});

                onDepartmentAdded(res.data.message);
                refreshKey()
            } else {
                console.error('Unexpected error occured during store role: ', res.data)
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                console.error('Unexpected server error during store role: ',
                    error
                );
            }
        }
        finally {
            setLoadingStore(false);
        }
    }
    return (
        <div className="flex flex-col gap-6">

            {/* Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Department Management
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                    Create and manage departments or offices within your organization.
                    Each department can be assigned users, permissions, and events.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">
                    Enter Your Department
                </h3>

                <form onSubmit={handleStoreDepartment} className="space-y-5">

                    <FloatingLabelInput
                        label="Department"
                        type="text"
                        name="department"
                        value={departmentName}
                        onChange={(e) => setdepartmentName(e.target.value)}
                        required
                        autoFocus
                        errors={errors.department_name}
                    />

                    <FloatingLabelInput
                        label="Description"
                        type="text"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="pt-2" >
                        <SubmitButton
                            label="Save Department"
                            loading={loadingStore}
                            loadingLabel="Saving Department..."
                        />
                    </div>

                </form>
            </div>

        </div>
    );
}

export default AddDepartmentForm;