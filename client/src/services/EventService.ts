import AxiosInstance from "./AxiosInstance";

const EventService = {
  loadEvent: async () => {
    try {
      const response = await AxiosInstance.get("/event/loadEvent");

      return response;
    } catch (error) {
      throw error;
    }
  },

  storeEvent: async (data: any) => {
    try {
      const response = await AxiosInstance.post("/event/storeEvent", data);

      return response;
    } catch (error) {
      throw error;
    }
  },

  updateEvent: async (eventId: string | number, data: any) => {
    try {
      const response = await AxiosInstance.put(
        `/event/updateEvent/${eventId}`,
        data,
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  destroyEvent: async (eventId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/event/destroyEvent/${eventId}`,
      );

      return response;
    } catch (error) {
      throw error;
    }
  },
  loadTrashEvent: async () => {
    try {
      const response = await AxiosInstance.get("/event/loadTrashEvent");

      return response;
    } catch (error) {
      throw error;
    }
  },
  restoreEvent: async (eventId: string | number) => {
    try {
      const response = await AxiosInstance.put(
        `/event/restoreEvent/${eventId}`,
      );

      return response;
    } catch (error) {
      throw error;
    }
  },
  forceDeleteEvent: async (eventId: string | number) => {
    try {
      const response = await AxiosInstance.delete(
        `/event/forceDeleteEvent/${eventId}`,
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  approveEvent: async (eventId: string | number) => {
    const response = await AxiosInstance.put(`/event/approveEvent/${eventId}`);
    return response;
  },

  rejectEvent: async (eventId: string | number, rejectionReason?: string) => {
    const response = await AxiosInstance.put(`/event/rejectEvent/${eventId}`, {
      rejection_reason: rejectionReason,
    });
    return response;
  },

  loadPendingEvents: async () => {
    try {
      const response = await AxiosInstance.get("/event/loadPendingEvents");
      return response;
    } catch (error) {
      throw error;
    }
  },

  loadUserEvents: async () => {
    try {
      const response = await AxiosInstance.get("/event/loadUserEvents");
      return response;
    } catch (error) {
      throw error;
    }
  },

  revertEvent: async (eventId: string | number) => {
    const response = await AxiosInstance.put(`/event/revertEvent/${eventId}`);
    return response;
  },

  loadAllEventsForReport: async () => {
    const response = await AxiosInstance.get("/event/loadAllEvents");
    return response;
  },

    checkConflict: async (data: any) => {
        try {
            const response = await AxiosInstance.post("/event/checkConflict", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default EventService;
