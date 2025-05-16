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
      // Check if service worker is ready
      if (!navigator.serviceWorker.controller) {
        console.log('Service worker not controlling the page yet');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Additional check to ensure sync is available
      if (!registration.sync) {
        console.log('Background sync API not available in this context');
        setSyncSupported(false);
        return false;
      }

      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      // If we get an error about Background Sync being disabled, update our state
      console.log('Error registering background sync:', error);
      if (error.toString().includes('disabled')) {
        setSyncSupported(false);
      }
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
      // Check if service worker is ready
      if (!navigator.serviceWorker.controller) {
        console.log('Service worker not controlling the page yet');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Check if periodicSync is available
      if (!(registration as any).periodicSync) {
        console.log('Periodic background sync API not available in this context');
        setPeriodicSyncSupported(false);
        return false;
      }

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
      console.log('Error registering periodic background sync:', error);
      // If we get an error about Periodic Sync being disabled, update our state
      if (error.toString().includes('disabled')) {
        setPeriodicSyncSupported(false);
      }
      return false;
    }
  };

  // Trigger a sync when coming back online
  useEffect(() => {
    // Only attempt to register sync if we're online and the feature is supported
    if (isOnline && syncSupported) {
      // Add a small delay to ensure service worker is fully registered
      const timer = setTimeout(() => {
        registerSync().catch(err => {
          console.log('Could not register sync on coming online:', err);
        });
      }, 2000);

      return () => clearTimeout(timer);
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
