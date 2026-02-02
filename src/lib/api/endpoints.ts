export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  GUEST: {
    SESSION: "/guest/session",
    GET_SESSION: (guestId: string) => `/guest/session/${guestId}`,
  },
  AUDIO: {
    UPLOAD: "/audio/upload",
    STATUS: (jobId: string) => `/audio/status/${jobId}`,
    DOWNLOAD: (jobId: string) => `/audio/download/${jobId}`,
  },
  USER: {
    SETTINGS: "/user/settings",
    USERNAME: "/user/settings/username",
    PASSWORD: "/user/settings/password",
    USAGE: "/user/usage",
  },
} as const;
