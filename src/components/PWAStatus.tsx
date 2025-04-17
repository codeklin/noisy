import { usePWA } from '@/context/PWAContext';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAStatus = () => {
  const { 
    isInstalled, 
    isStandalone, 
    isOnline, 
    syncSupported, 
    periodicSyncSupported,
    registerSync,
    checkConnection
  } = usePWA();

  const handleSyncClick = async () => {
    if (syncSupported) {
      const success = await registerSync();
      if (success) {
        console.log('Sync registered successfully');
      }
    }
  };

  const handleCheckConnection = async () => {
    const online = await checkConnection();
    console.log('Connection status:', online ? 'online' : 'offline');
  };

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-3">App Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Installation:</span>
          </div>
          <Badge variant={isInstalled || isStandalone ? "success" : "secondary"}>
            {isInstalled || isStandalone ? 'Installed' : 'Not Installed'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Connection:</span>
          </div>
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Background Sync:</span>
          </div>
          <Badge variant={syncSupported ? "success" : "secondary"}>
            {syncSupported ? 'Supported' : 'Not Supported'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Periodic Sync:</span>
          </div>
          <Badge variant={periodicSyncSupported ? "success" : "secondary"}>
            {periodicSyncSupported ? 'Supported' : 'Not Supported'}
          </Badge>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCheckConnection}
          className="text-xs"
        >
          Check Connection
        </Button>
        
        {syncSupported && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncClick}
            className="text-xs"
            disabled={!isOnline}
          >
            Trigger Sync
          </Button>
        )}
      </div>
    </div>
  );
};

export default PWAStatus;
