import persistentStorage from './persistentStorage';

/**
 * Utility to manage data synchronization between client and server
 * with offline support
 */

// Types for sync operations
export type SyncOperation = {
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  id?: string | number;
  timestamp: number;
};

// Function to queue an operation for sync
export const queueSyncOperation = async (
  operation: Omit<SyncOperation, 'timestamp'>
): Promise<void> => {
  const syncOp: SyncOperation = {
    ...operation,
    timestamp: Date.now(),
  };

  // Store in the offline queue
  await persistentStorage.addToOfflineQueue('sync', syncOp);

  // Try to trigger a sync if possible
  if ('serviceWorker' in navigator && 'SyncManager' in window && navigator.onLine) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-content-updates');
    } catch (error) {
      console.error('Failed to register sync:', error);
    }
  }
};

// Function to save content locally with sync support
export const saveContentWithSync = async (
  resource: string,
  data: any,
  id?: string | number
): Promise<void> => {
  // First save locally
  const storeId = id || `temp_${Date.now()}`;
  await persistentStorage.storeData(`${resource}`, { ...data, id: storeId });

  // Then queue for sync
  await queueSyncOperation({
    type: id ? 'update' : 'create',
    resource,
    data,
    id: storeId,
  });
};

// Function to delete content with sync support
export const deleteContentWithSync = async (
  resource: string,
  id: string | number
): Promise<void> => {
  // First delete locally
  await persistentStorage.deleteData(resource, id);

  // Then queue for sync
  await queueSyncOperation({
    type: 'delete',
    resource,
    data: null,
    id,
  });
};

// Function to process the sync queue (called by service worker)
export const processSyncQueue = async (): Promise<void> => {
  const processor = async (item: any) => {
    if (item.action !== 'sync') return;

    const operation: SyncOperation = item.data;
    
    try {
      // Here you would implement the actual API calls to sync with the server
      console.log(`Processing sync operation: ${operation.type} for ${operation.resource}`);
      
      // Example implementation (replace with actual API calls):
      switch (operation.type) {
        case 'create':
          // API call to create resource
          console.log('Creating resource:', operation.data);
          break;
        case 'update':
          // API call to update resource
          console.log('Updating resource:', operation.id, operation.data);
          break;
        case 'delete':
          // API call to delete resource
          console.log('Deleting resource:', operation.id);
          break;
      }
      
      // Mark as processed
      return true;
    } catch (error) {
      console.error('Error processing sync operation:', error);
      // Don't mark as processed so it will be retried
      return false;
    }
  };

  await persistentStorage.processOfflineQueue(processor);
};

// Export the sync manager
const syncManager = {
  queueSyncOperation,
  saveContentWithSync,
  deleteContentWithSync,
  processSyncQueue,
};

export default syncManager;
