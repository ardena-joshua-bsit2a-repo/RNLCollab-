import { useEffect, useState, type FC, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import RoleService from "../../../services/RoleService";
import { useParams } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner";
import type { RoleFieldErrors } from "../../../interfaces/RoleInterface";

interface EditRoleFormProps {
    onRoleUpdated: (message: string) => void;
}

const EditRoleForm: FC<EditRoleFormProps> = ({ onRoleUpdated }) => {
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<RoleFieldErrors>({});

    const { role_id } = useParams();

    const handleGetRole = async (role_id: string | number) => {
        try {
            setLoadingGet(true);

            const res = await RoleService.getRole(role_id);

            if (res.status === 200) {
                setRole(res.data.role.role_name);
                setDescription(res.data.role.role_description || "");
            } else {
                console.error("Unexpected status error occured during getting role:", res.status);
            }
        } catch (error) {
            console.error("Unexpected server error occured during getting role:", error);
        } finally {
            setLoadingGet(false);
        }
    };

    const handleUpdateRole = async (e: FormEvent) => {
        try {
            e.preventDefault();

            setLoadingUpdate(true);

            const res = await RoleService.updateRole(role_id!, {
                role_name: role,
                role_description: description,
            });

            if (res.status === 200) {
                setErrors({});
                setRole(res.data.role.role_name);
                onRoleUpdated(res.data.message);
            } else {
                console.error("Unexpected status error occured during updating role:", res.status);
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Unexpected server error occured during updating role:", error);
            }
        } finally {
            setLoadingUpdate(false);
        }
    };

    useEffect(() => {
        if (role_id) {
            const parsedRoleId = parseInt(role_id);
            handleGetRole(parsedRoleId);
        }
    }, [role_id]);

    return (
        <div className="max-w-2xl mx-auto">
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
                            Edit Role
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Update role information below
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleUpdateRole} className="p-6 space-y-5">

                        {/* Role Name */}
                        <FloatingLabelInput
                            label="Role"
                            type="text"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            autoFocus
                            errors={errors.role_name}
                        />

                        {/* Description */}
                        <FloatingLabelInput
                            label="Description"
                            type="text"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            errors={errors.role_description}
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-2 border-t border-gray-800">

                            {!loadingUpdate && (
                                <BackButton
                                    label="Back"
                                    path="/roles-permissions"
                                />
                            )}

                            <SubmitButton
                                label="Update Role"
                                loading={loadingUpdate}
                                loadingLabel="Updating Role..."
                                className="px-4 py-3 rounded-lg bg-emerald-500/10 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            />

                        </div>

                    </form>
                </div>
            )}
        </div>
    );
};

export default EditRoleForm;