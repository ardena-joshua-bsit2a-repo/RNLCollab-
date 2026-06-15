import { useEffect, useState, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import { useNavigate, useParams } from "react-router-dom";
import RoleService from "../../../services/RoleService";
import Spinner from "../../../components/Spinner/Spinner";

const DeleteRoleForm = () => {
  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingDestroy, setLoadingDestroy] = useState(false);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const { role_id } = useParams();
  const navigate = useNavigate();

  const handleGetRole = async (role_id: string | number) => {
    try {
      setLoadingGet(true);

      const res = await RoleService.getRole(role_id);

      if (res.status === 200) {
        setRole(res.data.role.role_name);
        setDescription(res.data.role.role_description || "");
      } else {
        console.error(
          "Unexpected status error occured during deleting role:",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occured during deleting role:",
        error
      );
    } finally {
      setLoadingGet(false);
    }
  };

  const handleDestroyRole = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingDestroy(true);

      const res = await RoleService.destroyRole(role_id!);

      if (res.status === 200) {
        navigate("/roles-permissions", {
          state: { message: res.data.message },
        });
      } else {
        console.error(
          "Unexpected status error occured during deleting role:",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occured during deleting role:",
        error
      );
    } finally {
      setLoadingDestroy(false);
    }
  };

  useEffect(() => {
    if (role_id) {
      const parsedRoleId = parseInt(role_id);
      handleGetRole(parsedRoleId);
    } else {
      console.error(
        "Unexpected parameter error occured during getting:",
        role_id
      );
    }
  }, [role_id]);

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
              Delete Role
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              This action cannot be undone.
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleDestroyRole} className="p-6 space-y-5">

            {/* Warning Box */}
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
              ⚠️ You are about to permanently delete this role.
            </div>

            {/* Role Info */}
            <div className="space-y-4">

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Role Name</p>
                <p className="text-white font-semibold">
                  {role}
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

              <BackButton
                label="Cancel"
                path="/roles-permissions"
              />

              <SubmitButton
                label="Delete Role"
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
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

export default DeleteRoleForm;