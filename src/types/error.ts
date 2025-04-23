export interface AppError extends Error {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}
