export const mediaCache = {
  dbPromise: null as Promise<IDBDatabase> | null,

  init() {
    if (!this.dbPromise && typeof indexedDB !== 'undefined') {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('AuraMediaCache', 1);
        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('media')) {
            db.createObjectStore('media');
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise || Promise.reject('indexedDB not supported');
  },

  async saveMedia(id: string, file: Blob) {
    const db = await this.init();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getMedia(id: string): Promise<Blob | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readonly');
      const req = tx.objectStore('media').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
};
