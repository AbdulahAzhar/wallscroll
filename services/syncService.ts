
import { Wallpaper, MediaType } from '../types';

const DB_KEY = 'walltok_wallpapers';
const SYNC_CHANNEL = 'walltok_cloud_sync';

// Initialize the broadcast channel for cross-tab sync
const broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);

const INITIAL_DATA: Wallpaper[] = [
  {
    id: '1',
    type: MediaType.VIDEO,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-starry-sky-at-night-over-a-mountain-4152-large.mp4',
    title: 'Starry Night',
    description: 'A beautiful night sky with flowing stars over a dark mountain.',
    author: 'CosmosExplorer',
    likes: 1240,
    tags: ['space', 'nature', 'dark'],
    createdAt: Date.now() - 1000000,
  },
  {
    id: '2',
    type: MediaType.IMAGE,
    url: 'https://picsum.photos/id/10/1080/1920',
    title: 'Forest Path',
    description: 'Serene walk through an ancient foggy forest.',
    author: 'NatureLover',
    likes: 850,
    tags: ['nature', 'forest', 'calm'],
    createdAt: Date.now() - 2000000,
  }
];

/**
 * Simulates a network delay for cloud operations
 */
const networkDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const fetchWallpapersFromCloud = async (): Promise<Wallpaper[]> => {
  await networkDelay();
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const pushWallpaperToCloud = async (wallpaper: Wallpaper): Promise<void> => {
  await networkDelay();
  const wallpapers = await fetchWallpapersFromCloud();
  wallpapers.unshift(wallpaper);
  localStorage.setItem(DB_KEY, JSON.stringify(wallpapers));
  
  // Notify other tabs/clients
  broadcastChannel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
};

export const deleteWallpaperFromCloud = async (id: string): Promise<void> => {
  await networkDelay();
  const wallpapers = await fetchWallpapersFromCloud();
  const filtered = wallpapers.filter(w => w.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  
  // Notify other tabs/clients
  broadcastChannel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
};

// Hook-like listener for other components
export const onCloudUpdate = (callback: () => void) => {
  const handler = (event: MessageEvent) => {
    if (event.data.type === 'SYNC_UPDATE') {
      callback();
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel.removeEventListener('message', handler);
};
