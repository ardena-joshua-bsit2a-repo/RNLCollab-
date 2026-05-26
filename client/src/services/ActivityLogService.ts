import AxiosInstance from "./AxiosInstance";
import type { ActivityLogFilters } from "../interfaces/ActivityLogInterface";

const ActivityLogService = {
    loadActivityLogs: async (filters?: ActivityLogFilters) => {
        const response = await AxiosInstance.get("/activity-logs/loadActivityLogs", {
            params: filters,
        });
        return response;
    },
};

export default ActivityLogService;
