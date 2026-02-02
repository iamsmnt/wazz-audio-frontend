import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { User, AuthTokens, LoginRequest, SignupRequest } from "@/types/api";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
