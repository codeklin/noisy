import { toast } from 'sonner';

/**
 * Fetch with retry functionality for API calls
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries (default: 3)
 * @param delay Initial delay in ms before retrying (default: 1000)
 * @param backoff Backoff factor for exponential backoff (default: 2)
 * @param timeout Timeout in ms before aborting the request (default: 30000)
 * @returns Promise with the fetch response
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000,
  backoff = 2,
  timeout = 30000
): Promise<Response> => {
  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add the signal to the options if it doesn't already have one
  const fetchOptions = {
    ...options,
    signal: options.signal || controller.signal
  };

  try {
    // Check if we're online before making the request
    if (!isOnline()) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId); // Clear the timeout if the request completes

    // If the response is not ok and we have retries left, retry the request
    if (!response.ok && retries > 0) {
      // Don't retry for certain status codes
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return response; // Don't retry auth errors or not found
      }

      console.warn(`Request to ${url} failed with status ${response.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * backoff, backoff, timeout);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId); // Clear the timeout if there's an error

    // Handle abort errors (timeouts)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after ${timeout}ms`);
      throw new Error(`Request timed out after ${timeout}ms. Please try again.`);
    }

    // If we have retries left, retry the request
    if (retries > 0) {
      // Don't retry for network errors if we're offline
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      console.warn(`Request to ${url} failed with error: ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * backoff, backoff, timeout);
    }

    // If we're out of retries, throw the error
    throw error;
  }
};

/**
 * Handle API errors in a consistent way
 * @param error The error to handle
 * @param customMessage Optional custom message to display
 * @param context Optional context information about where the error occurred
 * @returns The formatted error message that was displayed
 */
export const handleApiError = (error: unknown, customMessage?: string, context?: string): string => {
  console.error(`API error${context ? ` in ${context}` : ''}:`, error);

  let errorMessage = customMessage || 'An error occurred while communicating with the server.';
  let errorDetails = '';

  // Extract more specific error messages if available
  if (error instanceof Error) {
    errorDetails = error.message;

    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorDetails = 'Network error. Please check your internet connection.';
    }

    // Check for timeout errors
    if (error.name === 'AbortError') {
      errorDetails = 'Request timed out. Please try again.';
    }

    // Add error details if available
    if (errorDetails) {
      errorMessage = `${errorMessage} ${errorDetails}`;
    }
  } else if (typeof error === 'object' && error !== null) {
    // Try to extract message from error object
    const errorObj = error as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === 'string') {
      errorDetails = errorObj.message;
      errorMessage = `${errorMessage} ${errorDetails}`;
    }
  } else if (typeof error === 'string') {
    errorDetails = error;
    errorMessage = `${errorMessage} ${errorDetails}`;
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

  return errorMessage;
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
 * @param context Optional context information about where the parsing is happening
 * @returns Promise with the parsed JSON
 */
export const parseJsonResponse = async <T = Record<string, unknown>>(
  response: Response,
  context?: string
): Promise<T> => {
  // First check if the response is OK
  if (!response.ok) {
    const statusText = response.statusText || `Status code ${response.status}`;
    const errorMessage = `API request failed: ${statusText}`;

    try {
      // Try to get more detailed error information from the response
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        // If it's JSON, parse it to get more details
        const errorData = await response.json();
        const detailedMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        throw new Error(`${errorMessage} - ${detailedMessage}`);
      } else {
        // If it's not JSON, try to get the text
        const errorText = await response.text();
        throw new Error(`${errorMessage} - ${errorText || 'No additional details available'}`);
      }
    } catch (parseError) {
      // If we can't parse the error response, just throw with the status
      if (parseError instanceof Error && parseError.message !== errorMessage) {
        throw parseError; // This is our detailed error from above
      }
      throw new Error(errorMessage);
    }
  }

  // Then check if it's JSON
  if (!isJsonResponse(response)) {
    throw new Error(`Response is not JSON${context ? ` in ${context}` : ''}`);
  }

  try {
    return await response.json() as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response${context ? ` in ${context}` : ''}: ${error instanceof Error ? error.message : String(error)}`);
  }
};
