export interface ApiError {
  error?: {
    error?: string;
    message?: string;
  };
  message?: string;
  statusCode?: number;
}

export interface HttpErrorResponse {
  error: ApiError | string;
  status: number;
  statusText: string;
}
