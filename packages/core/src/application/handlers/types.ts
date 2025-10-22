/**
 * Cloud-agnostic HTTP request representation
 */
export type HttpRequest = {
  method: string;
  path: string;
  body: Record<string, unknown>;
  query: Record<string, string>;
};

/**
 * Cloud-agnostic HTTP response representation
 */
export type HttpResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

/**
 * Error response structure
 */
export type ErrorResponse = {
  error: string;
  message: string;
};
