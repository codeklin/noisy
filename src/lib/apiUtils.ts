import { toast } from 'sonner';

/**
 * Fetch with retry functionality for API calls
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries (default: 3)
 * @param delay Initial delay in ms before retrying (default: 1000)
 * @param backoff Backoff factor for exponential backoff (default: 2)
 * @returns Promise with the fetch response
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    // If the response is not ok and we have retries left, retry the request
    if (!response.ok && retries > 0) {
      console.warn(`Request to ${url} failed with status ${response.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * backoff, backoff);
    }

    return response;
  } catch (error) {
    // If we have retries left, retry the request
    if (retries > 0) {
      console.warn(`Request to ${url} failed with error: ${error}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * backoff, backoff);
    }

    // If we're out of retries, throw the error
    throw error;
  }
};

/**
 * Handle API errors in a consistent way
 * @param error The error to handle
 * @param customMessage Optional custom message to display
 */
export const handleApiError = (error: unknown, customMessage?: string): void => {
  console.error('API error:', error);

  let errorMessage = customMessage || 'An error occurred while communicating with the server.';

  // Extract more specific error messages if available
  if (error instanceof Error) {
    errorMessage = `${errorMessage} ${error.message}`;
  }

  // Show a toast notification
  try {
    toast.error('API Error', {
      description: errorMessage,
      duration: 5000,
      closeButton: true,
    });
  } catch (e) {
    // If toast fails, log to console
    console.error('Failed to show error toast:', e);
  }
};

/**
 * Check if the device is online
 * @returns Boolean indicating if the device is online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Check if a response is a JSON response
 * @param response The fetch response
 * @returns Boolean indicating if the response is JSON
 */
export const isJsonResponse = (response: Response): boolean => {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('application/json');
};

/**
 * Parse a response as JSON with error handling
 * @param response The fetch response
 * @returns Promise with the parsed JSON
 */
export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
  if (!isJsonResponse(response)) {
    throw new Error('Response is not JSON');
  }

  try {
    return await response.json() as T;
  } catch (error) {
    throw new Error('Failed to parse JSON response');
  }
};
