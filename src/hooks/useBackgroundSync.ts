import { useEffect, useState } from 'react';
import useOnlineStatus from './useOnlineStatus';

/**
 * Hook to handle background sync registration for offline operations
 */
export function useBackgroundSync() {
  const { isOnline } = useOnlineStatus();
  const [syncSupported, setSyncSupported] = useState<boolean>(false);
  const [periodicSyncSupported, setPeriodicSyncSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if background sync is supported
    const checkSyncSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        setSyncSupported(true);
      }

      // Check if periodic sync is supported
      if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const permission = await navigator.permissions.query({
            name: 'periodic-background-sync' as any,
          });

          if (permission.state === 'granted') {
            setPeriodicSyncSupported(true);
          }
        } catch (error) {
          console.log('Periodic sync not supported:', error);
        }
      }
    };

    checkSyncSupport();
  }, []);

  // Register for background sync
  const registerSync = async (tag: string = 'sync-content-updates'): Promise<boolean> => {
    if (!syncSupported) {
      console.log('Background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  };

  // Register for periodic background sync
  const registerPeriodicSync = async (
    tag: string = 'update-content',
    minInterval: number = 24 * 60 * 60 * 1000 // Default: once per day
  ): Promise<boolean> => {
    if (!periodicSyncSupported) {
      console.log('Periodic background sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const periodicSync = (registration as any).periodicSync;

      // Check if we already have a registration for this tag
      const tags = await periodicSync.getTags();

      if (tags.includes(tag)) {
        console.log('Periodic sync already registered for:', tag);
        return true;
      }

      await periodicSync.register(tag, {
        minInterval,
      });

      console.log('Periodic background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Error registering periodic background sync:', error);
      return false;
    }
  };

  // Trigger a sync when coming back online
  useEffect(() => {
    if (isOnline && syncSupported) {
      registerSync();
    }
  }, [isOnline, syncSupported]);

  return {
    syncSupported,
    periodicSyncSupported,
    registerSync,
    registerPeriodicSync,
  };
}

export default useBackgroundSync;
