import { Outlet } from "react-router-dom"
import AppHeader from "./AppHeader"
import AppSidebar from "./AppSidebar"
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext"
import { HeaderProvider } from "../contexts/HeaderContext"

const LayoutContent = () => {
    const { isOpen } = useSidebar();

    return (
        <>
            <AppSidebar />
            <AppHeader />
            <div className={`pt-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300 ${isOpen ? "sm:pl-64" : "sm:pl-[68px]"}`}>
                <div className="p-4 sm:p-6">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

const AppLayout = () => {
    return (
        <HeaderProvider>
            <SidebarProvider>
                <LayoutContent />
            </SidebarProvider>
        </HeaderProvider>
    );
};

export default AppLayout;