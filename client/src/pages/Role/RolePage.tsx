import { useEffect } from "react";
import AddRoleForm from "./components/AddRoleForm";
import RoleList from "./components/RoleList";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { useRefresh } from "../../hooks/useRefresh";
import { useLocation } from "react-router-dom";

const RolePage = () => {
  const location = useLocation();

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  const { refresh, handleRefresh } = useRefresh(false);

  useEffect(() => {
    document.title = "Role Management";
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToastMessage(location.state.message);
      handleRefresh();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToastMessage]);

  return (
    <>
      {/* Toast */}
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />

      <div className="min-h-screen bg-gray-950 text-white p-6">

        {/* Page Container */}
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              Role Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage system roles and permissions
            </p>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Add Role */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                Add Role
              </h2>

              <AddRoleForm
                onRoleAdded={showToastMessage}
                refreshKey={handleRefresh}
              />
            </div>

            {/* Role List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                Role List
              </h2>

              <RoleList refreshKey={refresh} />
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default RolePage; 