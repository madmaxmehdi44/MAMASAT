/**
 * MOMSAT TV - Channel Daily Thumbnail Capture & Storage Service
 * Uses IndexedDB for reliable client-side storage of daily video screenshots.
 * Automatically manages 24-hour expiration: captures once per day, and replaces
 * yesterday's screenshot on subsequent days.
 */

export interface ChannelScreenshot {
  channelId: number;
  channelName: string;
  dataUrl: string;
  dateString: string; // Format: "YYYY-MM-DD"
  timestamp: number;
}

const DB_NAME = 'momsat_thumbnails_db';
const DB_VERSION = 1;
const STORE_NAME = 'channel_thumbnails';

// In-memory cache for ultra-fast synchronous rendering in React
let memoryCache: Record<number, ChannelScreenshot> = {};
let isDbInitialized = false;

// Get current date string formatted as "YYYY-MM-DD"
export const getTodayDateString = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'channelId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Load all saved screenshots into memory cache
export async function initThumbnailStorage(): Promise<Record<number, ChannelScreenshot>> {
  if (isDbInitialized && Object.keys(memoryCache).length > 0) {
    return memoryCache;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result as ChannelScreenshot[]) || [];
        const map: Record<number, ChannelScreenshot> = {};
        results.forEach((item) => {
          map[item.channelId] = item;
        });
        memoryCache = map;
        isDbInitialized = true;
        resolve(map);
      };

      request.onerror = () => {
        console.warn('Failed to fetch thumbnails from IndexedDB');
        resolve(memoryCache);
      };
    });
  } catch (err) {
    console.warn('IndexedDB initialization failed, using memory cache:', err);
    return memoryCache;
  }
}

// Check if a channel needs a screenshot today
// Returns true if:
// 1) No screenshot exists for this channel yet, OR
// 2) The existing screenshot is from yesterday or older (dateString !== today)
export function isScreenshotNeededToday(channelId: number): boolean {
  const cached = memoryCache[channelId];
  if (!cached) return true;

  const today = getTodayDateString();
  return cached.dateString !== today;
}

// Save or replace a daily screenshot
export async function saveChannelScreenshot(
  channelId: number,
  channelName: string,
  dataUrl: string
): Promise<ChannelScreenshot> {
  const today = getTodayDateString();
  const record: ChannelScreenshot = {
    channelId,
    channelName,
    dataUrl,
    dateString: today,
    timestamp: Date.now(),
  };

  // 1. Update in-memory cache
  memoryCache[channelId] = record;

  // 2. Persist to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
  } catch (err) {
    console.warn('Failed to persist screenshot to IndexedDB:', err);
  }

  // 3. Dispatch browser event for reactive UI updates
  if (typeof window !== 'undefined') {
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent('momsat_thumbnail_updated', {
          detail: record,
        })
      );
    });
  }

  return record;
}

// Get the thumbnail for a specific channel
export function getChannelScreenshotSync(channelId: number): ChannelScreenshot | null {
  return memoryCache[channelId] || null;
}

// Capture frame from video element
export function captureVideoFrame(video: HTMLVideoElement): string | null {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
    return null;
  }

  try {
    const canvas = document.createElement('canvas');
    // High-definition 16:9 thumbnail: 640x360
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.warn('Canvas frame capture prevented (likely CORS):', err);
    return null;
  }
}
