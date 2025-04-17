/**
 * Enhanced persistent storage utility for PWA
 * Provides methods for storing and retrieving data with fallbacks
 */

// Check if IndexedDB is available
const isIndexedDBAvailable = () => {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch (e) {
    return false;
  }
};

// Database configuration
const DB_NAME = 'noisy-pwa-db';
const DB_VERSION = 1;
const STORES = {
  userData: 'userData',
  contentPlans: 'contentPlans',
  appSettings: 'appSettings',
  offlineQueue: 'offlineQueue'
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(new Error('Could not open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.userData)) {
        db.createObjectStore(STORES.userData, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.contentPlans)) {
        db.createObjectStore(STORES.contentPlans, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.appSettings)) {
        db.createObjectStore(STORES.appSettings, { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains(STORES.offlineQueue)) {
        const offlineStore = db.createObjectStore(STORES.offlineQueue, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        offlineStore.createIndex('processed', 'processed', { unique: false });
      }
    };
  });
};

// Generic function to store data in IndexedDB
const storeData = async <T>(storeName: string, data: T): Promise<T> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => {
        resolve(data);
      };
      
      request.onerror = (event) => {
        console.error(`Error storing data in ${storeName}:`, event);
        reject(new Error(`Failed to store data in ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    // Fallback to localStorage if IndexedDB fails
    console.warn('Falling back to localStorage:', error);
    const key = `${storeName}_${(data as any).id || (data as any).key || 'data'}`;
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }
};

// Generic function to retrieve data from IndexedDB
const getData = async <T>(storeName: string, key: string | number): Promise<T | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving data from ${storeName}:`, event);
        reject(new Error(`Failed to retrieve data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    // Fallback to localStorage if IndexedDB fails
    console.warn('Falling back to localStorage:', error);
    const localKey = `${storeName}_${key}`;
    const data = localStorage.getItem(localKey);
    return data ? JSON.parse(data) : null;
  }
};

// Function to get all data from a store
const getAllData = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving all data from ${storeName}:`, event);
        reject(new Error(`Failed to retrieve all data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    // Fallback to localStorage if IndexedDB fails
    console.warn('Falling back to localStorage for getAllData:', error);
    const allData: T[] = [];
    
    // Try to find all keys that start with the storeName
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${storeName}_`)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allData.push(JSON.parse(data));
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
    }
    
    return allData;
  }
};

// Function to delete data from a store
const deleteData = async (storeName: string, key: string | number): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting data from ${storeName}:`, event);
        reject(new Error(`Failed to delete data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    // Fallback to localStorage if IndexedDB fails
    console.warn('Falling back to localStorage for deleteData:', error);
    const localKey = `${storeName}_${key}`;
    localStorage.removeItem(localKey);
  }
};

// Function to add an item to the offline queue
const addToOfflineQueue = async (action: string, data: any): Promise<void> => {
  const queueItem = {
    action,
    data,
    timestamp: Date.now(),
    processed: false
  };
  
  await storeData(STORES.offlineQueue, queueItem);
};

// Function to process the offline queue when online
const processOfflineQueue = async (processor: (item: any) => Promise<void>): Promise<void> => {
  try {
    const items = await getAllData(STORES.offlineQueue);
    const unprocessedItems = items.filter(item => !item.processed);
    
    for (const item of unprocessedItems) {
      try {
        await processor(item);
        item.processed = true;
        await storeData(STORES.offlineQueue, item);
      } catch (error) {
        console.error('Error processing offline queue item:', error);
      }
    }
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
};

// Function to clear processed items from the queue
const clearProcessedQueue = async (): Promise<void> => {
  try {
    const db = await initDB();
    const items = await getAllData(STORES.offlineQueue);
    const processedItems = items.filter(item => item.processed);
    
    const transaction = db.transaction(STORES.offlineQueue, 'readwrite');
    const store = transaction.objectStore(STORES.offlineQueue);
    
    for (const item of processedItems) {
      store.delete(item.id);
    }
    
    transaction.oncomplete = () => {
      db.close();
    };
  } catch (error) {
    console.error('Error clearing processed queue:', error);
  }
};

// Export the storage API
export const persistentStorage = {
  stores: STORES,
  storeData,
  getData,
  getAllData,
  deleteData,
  addToOfflineQueue,
  processOfflineQueue,
  clearProcessedQueue
};

// Export types for TypeScript
export type OfflineQueueItem = {
  id?: number;
  action: string;
  data: any;
  timestamp: number;
  processed: boolean;
};

export default persistentStorage;
