import { useState, useEffect } from 'react';

/**
 * Hook to track online/offline status and provide reconnection functionality
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState<boolean>(false);

  useEffect(() => {
    // Function to handle online status change
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setReconnecting(true);
        // Give time for the connection to stabilize
        setTimeout(() => {
          setReconnecting(false);
          setWasOffline(false);
        }, 2000);
      }
    };

    // Function to handle offline status change
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Function to manually check connection
  const checkConnection = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to verify connection
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  };

  return {
    isOnline,
    wasOffline,
    reconnecting,
    checkConnection,
  };
}

export default useOnlineStatus;
