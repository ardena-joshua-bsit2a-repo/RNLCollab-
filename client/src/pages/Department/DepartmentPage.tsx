
import AddDepartmentForm from "./components/AddDepartmentForm"
import DepartmentList from "./components/DepartmentList"
import ToastMessage from "../../components/ToastMessage/ToastMessage"
import { useToastMessage } from "../../hooks/useToastMessage"
import { useRefresh } from "../../hooks/useRefresh"
import { useEffect } from "react"
import { useLocation } from "react-router-dom";

const DepartmentPage = () => {
  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);

  const { refresh, handleRefresh } = useRefresh(false);
  const location = useLocation();

    useEffect(() => {
      if (location.state?.message) {
        showToastMessage(location.state.message);
        handleRefresh();
        window.history.replaceState({}, document.title);
      }
    }, [location.state, showToastMessage]);
  return (
  <>
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
            Department Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage departments and organizational structure
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Add Department */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Add Department
            </h2>

            <AddDepartmentForm
              onDepartmentAdded={showToastMessage}
              refreshKey={handleRefresh}
            />
          </div>

          {/* Department List */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Department List
            </h2>

            <DepartmentList refreshKey={refresh} />
          </div>

        </div>

      </div>
    </div>
  </>
);
}

export default DepartmentPage;