/**
 * Offline Submission Queue & Sync Manager for KisanCred Farmer PWA
 * Designed for low-connectivity rural environments.
 * Stores pending upload submissions and syncs automatically when network recovers.
 */

const STORAGE_KEY = 'kisancred_offline_queue';

class OfflineQueue {
  constructor() {
    this.listeners = new Set();
    this.isSyncing = false;

    // Listen to online events for automatic background flushing
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyListeners('online');
        this.syncPending();
      });
      window.addEventListener('offline', () => {
        this.notifyListeners('offline');
      });
    }
  }

  getQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('LocalStorage unavailable for offline queue:', e);
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners('change');
    } catch (e) {
      console.warn('Failed to persist offline queue:', e);
    }
  }

  /**
   * Enqueue a new offline submission
   * @param {'mandi_receipt'|'crop_cycle'|'insurance_doc'|'consent_action'} type
   * @param {Object} payload
   * @returns {Object} Queued item with UUID and timestamp
   */
  enqueue(type, payload) {
    const queue = this.getQueue();
    const item = {
      id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };
    queue.push(item);
    this.saveQueue(queue);
    return item;
  }

  getPending() {
    return this.getQueue().filter((item) => item.status === 'pending');
  }

  getPendingCount() {
    return this.getPending().length;
  }

  remove(id) {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  }

  markSynced(id) {
    const queue = this.getQueue().map((item) =>
      item.id === id ? { ...item, status: 'synced', syncedAt: new Date().toISOString() } : item
    );
    this.saveQueue(queue);
  }

  markFailed(id, errorMsg) {
    const queue = this.getQueue().map((item) =>
      item.id === id ? { ...item, retryCount: (item.retryCount || 0) + 1, lastError: errorMsg } : item
    );
    this.saveQueue(queue);
  }

  clearSynced() {
    const queue = this.getQueue().filter((item) => item.status !== 'synced');
    this.saveQueue(queue);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(eventType) {
    this.listeners.forEach((listener) => {
      try {
        listener(eventType, this.getPendingCount());
      } catch (e) {
        console.error('Offline queue listener error:', e);
      }
    });
  }

  /**
   * Synchronize all pending items with the server
   * @param {Function} [customSyncHandler] Optional server callback
   */
  async syncPending(customSyncHandler) {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const pending = this.getPending();
    if (pending.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners('sync_start');

    try {
      for (const item of pending) {
        try {
          if (customSyncHandler) {
            await customSyncHandler(item);
          } else {
            // Simulated network latency for upload sync
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
          this.markSynced(item.id);
        } catch (err) {
          console.warn(`Sync failed for item ${item.id}:`, err);
          this.markFailed(item.id, err.message);
        }
      }
    } finally {
      this.isSyncing = false;
      this.clearSynced();
      this.notifyListeners('sync_complete');
    }
  }
}

export const offlineQueue = new OfflineQueue();
