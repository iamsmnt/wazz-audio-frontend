import { API_ENDPOINTS } from "./endpoints";
import { API_BASE_URL, getAuthHeaders } from "./client";
import type { StatusResponse, UploadResponse, Project } from "@/types/api";

export const audioApi = {
  upload: async (
    file: File,
    onProgress?: (progress: number) => void,
    processingType?: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (processingType) {
      formData.append("processing_type", processingType);
    }

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            const msg =
              typeof errorData.detail === "string"
                ? errorData.detail
                : errorData.detail?.message || "Upload failed";
            reject(new Error(msg));
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));

      xhr.open("POST", `${API_BASE_URL}${API_ENDPOINTS.AUDIO.UPLOAD}`);

      const headers = getAuthHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  },

  subscribeToStatus: (jobId: string): EventSource => {
    const params = new URLSearchParams();
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (token) {
      params.set("token", token);
    } else {
      let guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
      }
      params.set("guest_id", guestId);
    }

    return new EventSource(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.STREAM(jobId)}?${params.toString()}`
    );
  },

  getStatus: async (jobId: string): Promise<StatusResponse> => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.STATUS(jobId)}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch job status");
    return response.json();
  },

  getDownloadUrl: (jobId: string): string => {
    return `${API_BASE_URL}${API_ENDPOINTS.AUDIO.DOWNLOAD(jobId)}`;
  },

  // Fetch audio as a blob with auth headers, return an object URL
  // (needed for WaveSurfer which can't send custom headers)
  fetchAsBlobUrl: async (jobId: string): Promise<string> => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.DOWNLOAD(jobId)}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch processed audio");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  downloadFile: async (jobId: string, originalFilename: string) => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.DOWNLOAD(jobId)}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) throw new Error("Download failed");

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match?.[1]) filename = match[1];
    }

    if (!filename && originalFilename) {
      const lastDot = originalFilename.lastIndexOf(".");
      const name =
        lastDot > 0 ? originalFilename.substring(0, lastDot) : originalFilename;
      const ext = lastDot > 0 ? originalFilename.substring(lastDot) : "";
      filename = `${name}_processed${ext}`;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "processed_audio.wav";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.PROJECTS}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
  },

  renameProject: async (jobId: string, projectName: string): Promise<Project> => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.PROJECT(jobId)}`,
      {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: projectName }),
      }
    );
    if (!response.ok) throw new Error("Failed to rename project");
    return response.json();
  },

  deleteProject: async (jobId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUDIO.PROJECT(jobId)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to delete project");
  },
};
