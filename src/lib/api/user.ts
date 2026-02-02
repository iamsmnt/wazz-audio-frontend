import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { UsageStats } from "@/types/api";

export const userApi = {
  getSettings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USER.SETTINGS);
    return response.data;
  },

  updateUsername: async (newUsername: string) => {
    const response = await apiClient.put(API_ENDPOINTS.USER.USERNAME, {
      new_username: newUsername,
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put(API_ENDPOINTS.USER.PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getUsageStats: async (): Promise<UsageStats> => {
    const response = await apiClient.get<UsageStats>(API_ENDPOINTS.USER.USAGE);
    return response.data;
  },
};
