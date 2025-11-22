
// Simple Promise-based wrapper for IndexedDB
const DB_NAME = 'DevOpsChatDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_CONFIG = 'config';
const STORE_SNIPPETS = 'snippets';

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_SESSIONS)) db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
            if (!db.objectStoreNames.contains(STORE_CONFIG)) db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
            if (!db.objectStoreNames.contains(STORE_SNIPPETS)) db.createObjectStore(STORE_SNIPPETS, { keyPath: 'id' });
        };

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
};

export const db = {
    async get(storeName: string, key: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    async getAll(storeName: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    async put(storeName: string, value: any) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    async putAll(storeName: string, values: any[]) {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
             const tx = db.transaction(storeName, 'readwrite');
             const store = tx.objectStore(storeName);
             
             // This is a naive bulk put implementation
             // Ideally we would clear and replace for sessions if syncing fully
             // For this app, we'll assume 'put' overwrites by key
             values.forEach(val => store.put(val));
             
             tx.oncomplete = () => resolve();
             tx.onerror = () => reject(tx.error);
        });
    },
    async delete(storeName: string, key: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    async clear(storeName: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

export const STORES = {
    SESSIONS: STORE_SESSIONS,
    CONFIG: STORE_CONFIG,
    SNIPPETS: STORE_SNIPPETS
};
