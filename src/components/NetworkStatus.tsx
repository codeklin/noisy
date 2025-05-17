import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Function to update online status
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        toast.success('You are back online!', {
          description: 'All features are now available.',
          duration: 3000,
          closeButton: true,
        });
      } else {
        toast.error('You are offline', {
          description: 'Some features may be unavailable.',
          duration: 5000,
          closeButton: true,
        });
      }
    };

    // Add event listeners
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Clean up
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [toast]);

  // Only show the offline indicator
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-2 rounded-full shadow-lg flex items-center">
      <WifiOff className="h-4 w-4 mr-1" />
      <span className="text-xs font-medium">Offline</span>
    </div>
  );
};

export default NetworkStatus;
