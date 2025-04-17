import { useEffect, useState } from 'react';
import { AlertCircle, WifiOff, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useOnlineStatus from '@/hooks/useOnlineStatus';

const OfflineNotification = () => {
  const { isOnline, wasOffline, reconnecting, checkConnection } = useOnlineStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Show offline notification when user goes offline
    if (!isOnline) {
      setShowNotification(true);
    } else if (wasOffline) {
      // When reconnected, show the reconnected message
      setShowNotification(false);
      setShowReconnected(true);

      // Hide the reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [isOnline, wasOffline]);

  // Handle manual refresh
  const handleRefresh = async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      window.location.reload();
    }
  };

  if (!showNotification && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 flex justify-center">
      {showNotification && (
        <Alert className="bg-red-50 border-red-200 text-red-800 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex-1">
              You're offline. Some features may be unavailable.
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2 bg-white border-red-200 text-red-800 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {showReconnected && (
        <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex-1">
              {reconnecting ? 'Reconnecting...' : 'You\'re back online!'}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReconnected(false)}
              className="p-0 h-6 w-6 rounded-full hover:bg-green-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default OfflineNotification;
