import AxiosInstance from "./AxiosInstance";

const NotificationService = {
    getNotifications: async () => {
        const response = await AxiosInstance.get('/notifications');
        return response;
    },
    markAsRead: async (id: number) => {
        const response = await AxiosInstance.put(`/notifications/${id}/read`);
        return response;
    },
    markAllAsRead: async () => {
        const response = await AxiosInstance.put('/notifications/read-all');
        return response;
    },
};

export default NotificationService;