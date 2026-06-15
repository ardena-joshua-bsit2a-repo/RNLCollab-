import AxiosInstance from "./AxiosInstance";

const UserService = {
    loadUsers: async () => {
        try {
            const response = await AxiosInstance.get(
                "/users/loadUsers"
            );

            return response;
        } catch (error) {
            throw error;
        }
    },
    storeUser: async (data: any) => {
        try {
            const response = await AxiosInstance.post(
                "/users/storeUser", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateUser: async (userId: string | number, data: any) => {
        try {
            const response = await AxiosInstance.put(
                `/users/updateUser/${userId}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    destroyUser: async (userId: string | number) => {
        try{
            const response = await AxiosInstance.put(`/users/destroyUser/${userId}`);
            return response 
        } catch(error) {
            throw error; 
        }
    },
    loadTrashUsers: async () => {
        try {
            const response = await AxiosInstance.get(
                "/users/loadTrashUsers"
            );

            return response;
        } catch (error) {
            throw error;
        }
    },
    restoreUser: async (
        userId: string | number
    ) => {
        try {
            const response = await AxiosInstance.put(
                `/users/restoreUser/${userId}`
            );

            return response;
        } catch (error) {
            throw error;
        }
    },
    forceDeleteUser: async (
        userId: string | number
    ) => {
        try {
            const response = await AxiosInstance.delete(
                `/users/forceDeleteUser/${userId}`
            );

            return response;
        } catch (error) {
            throw error;
        }
    },
    uploadProfilePhoto: async (userId: string | number, file: File) => {
        try {
            const formData = new FormData();
            formData.append("profile_photo", file);
            const response = await AxiosInstance.post(
                `/users/uploadProfilePhoto/${userId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    removeProfilePhoto: async (userId: string | number) => {
        try {
            const response = await AxiosInstance.delete(`/users/removeProfilePhoto/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (data: any) => {
        const response = await AxiosInstance.put('/profile/update', data);
        return response;
    },
}

export default UserService;