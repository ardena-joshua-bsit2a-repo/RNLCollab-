import { Route, Routes } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import RolePage from "../pages/Role/RolePage"
import EditRolePage from "../pages/Role/EditRolePage"
import DeleteRolePage from "../pages/Role/DeleteRolePage"
import DepartmentPage from "../pages/Department/DepartmentPage"
import EditDepartmentPage from "../pages/Department/EditDepartmentPage"
import DeleteDepartmentPage from "../pages/Department/DeleteDepartmentPage"
import UserMainPage from "../pages/User/UserMainPage"
import TrashMainPage from "../pages/Trash/TrashMainPage"
import VenuePage from "../pages/Venue/VenuePage"
import EditVenuePage from "../pages/Venue/EditVenuePage"
import DeleteVenuePage from "../pages/Venue/DeleteVenuePage"
import EventMainPage from "../pages/Events/EventMainPage"
import TrashEventPage from "../pages/Trash/TrashEventPage"
import DashboardPage from "../pages/Dashboard/DashboardPage"
import ActivityLogsPage from "../pages/ActivityLogs/ActivityLogsPage"
import LoginPage from "../pages/Auth/LoginPage"
import ProtectedRoute from "./ProtectedRoute"
import AdminEventReviewPage from "../pages/AdminApproval/AdminEventReviewPage"
import ReportsPage from "../pages/Reports/ReportsPage"
import ProfilePage from "../pages/Profile/ProfilePage"

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />

                    <Route element={<ProtectedRoute requireSuperAdmin />}>
                        <Route path="/roles-permissions" element={<RolePage />} />
                        <Route path="/roles-permissions/edit/:role_id" element={<EditRolePage />} />
                        <Route path="/roles-permissions/delete/:role_id" element={<DeleteRolePage />} />

                        <Route path="/departments" element={<DepartmentPage />} />
                        <Route path="/departments/edit/:department_id" element={<EditDepartmentPage />} />
                        <Route path="/departments/delete/:department_id" element={<DeleteDepartmentPage />} />

                        <Route path="/users" element={<UserMainPage />} />
                        <Route path="/user-trash" element={<TrashMainPage />} />
                        <Route path="/logs" element={<ActivityLogsPage />} />
                        <Route path="/event-approval" element={<AdminEventReviewPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                    </Route>

                    <Route path="/venue" element={<VenuePage />} />
                    <Route path="/venue/edit/:venue_id" element={<EditVenuePage />} />
                    <Route path="/venue/delete/:venue_id" element={<DeleteVenuePage />} />
                    <Route path="/event-trash" element={<TrashEventPage />} />  

                    <Route path="/events" element={<EventMainPage />} />
                    
                </Route>
            </Route>
        </Routes>
    )
}

export default AppRoutes;
