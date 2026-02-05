export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface UploadResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  filename: string;
  original_filename: string;
}

export interface StatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  filename: string;
  original_filename: string;
  error_message?: string;
  processing_type?: string;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Project {
  job_id: string;
  project_name: string | null;
  filename: string;
  original_filename: string;
  status: JobStatus;
  processing_type: string | null;
  created_at: string;
  duration?: number;
  file_size?: number;
  file_format?: string;
}

export interface UsageStats {
  total_files_uploaded: number;
  total_files_processed: number;
  total_files_downloaded: number;
  total_files_failed: number;
  total_input_size_mb: number;
  total_output_size_mb: number;
  total_processing_time_minutes: number;
  processing_types_count: Record<string, number>;
  first_upload_at?: string | null;
  last_upload_at?: string | null;
  last_download_at?: string | null;
  api_calls_count: number;
  last_api_call_at?: string | null;
}

export interface GuestSession {
  guest_id: string;
}
