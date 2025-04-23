import React, { createContext, useContext, useState, useEffect } from 'react';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import useBackgroundSync from '@/hooks/useBackgroundSync';

type PWAContextType = {
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  wasOffline: boolean;
  syncSupported: boolean;
  periodicSyncSupported: boolean;
  registerSync: (tag?: string) => Promise<boolean>;
  registerPeriodicSync: (tag?: string, minInterval?: number) => Promise<boolean>;
  checkConnection: () => Promise<boolean>;
};

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const {
    isOnline,
    wasOffline,
    checkConnection
  } = useOnlineStatus();

  const {
    syncSupported,
    periodicSyncSupported,
    registerSync,
    registerPeriodicSync
  } = useBackgroundSync();

  useEffect(() => {
    // Check if the app is installed
    const checkInstallState = () => {
      // Check if in standalone mode (installed)
      const isInStandaloneMode = () => {
        // Check if the app is in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Check for iOS standalone mode
        const nav = window.navigator as Navigator & { standalone?: boolean };
        const isIOSStandalone = nav.standalone === true;

        // Check for Android app
        const isAndroidApp = document.referrer.includes('android-app://');

        return isStandalone || isIOSStandalone || isAndroidApp;
      };

      setIsStandalone(isInStandaloneMode());

      // Also check for installation event
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        console.log('PWA was installed');
      });
    };

    checkInstallState();
  }, []);

  // Register for periodic sync when online
  useEffect(() => {
    if (isOnline && periodicSyncSupported) {
      registerPeriodicSync();
    }
  }, [isOnline, periodicSyncSupported, registerPeriodicSync]);

  const value = {
    isInstalled,
    isStandalone,
    isOnline,
    wasOffline,
    syncSupported,
    periodicSyncSupported,
    registerSync,
    registerPeriodicSync,
    checkConnection,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export default PWAProvider;
