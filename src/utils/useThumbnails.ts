import { useState, useEffect } from 'react';
import { 
  initThumbnailStorage, 
  getChannelScreenshotSync, 
  type ChannelScreenshot,
  getTodayDateString 
} from './thumbnailStorage';

export function useChannelThumbnails(): Record<number, ChannelScreenshot> {
  const [thumbnails, setThumbnails] = useState<Record<number, ChannelScreenshot>>({});

  useEffect(() => {
    // Load from IndexedDB on startup
    initThumbnailStorage().then((data) => {
      setThumbnails({ ...data });
    });

    // Listen for real-time daily screenshot updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ChannelScreenshot>;
      if (customEvent.detail) {
        setThumbnails((prev) => ({
          ...prev,
          [customEvent.detail.channelId]: customEvent.detail,
        }));
      }
    };

    window.addEventListener('momsat_thumbnail_updated', handleUpdate);
    return () => {
      window.removeEventListener('momsat_thumbnail_updated', handleUpdate);
    };
  }, []);

  return thumbnails;
}

export function useSingleChannelThumbnail(channelId: number): ChannelScreenshot | null {
  const [thumbnail, setThumbnail] = useState<ChannelScreenshot | null>(() => 
    getChannelScreenshotSync(channelId)
  );

  useEffect(() => {
    initThumbnailStorage().then(() => {
      setThumbnail(getChannelScreenshotSync(channelId));
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ChannelScreenshot>;
      if (customEvent.detail && customEvent.detail.channelId === channelId) {
        setThumbnail(customEvent.detail);
      }
    };

    window.addEventListener('momsat_thumbnail_updated', handleUpdate);
    return () => {
      window.removeEventListener('momsat_thumbnail_updated', handleUpdate);
    };
  }, [channelId]);

  return thumbnail;
}
