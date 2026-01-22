
import { Wallpaper, MediaType } from '../types';

const DB_KEY = 'walltok_wallpapers';

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
  },
  {
    id: '3',
    type: MediaType.VIDEO,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-shore-at-sunset-4468-large.mp4',
    title: 'Golden Waves',
    description: 'The rhythmic motion of ocean waves during the golden hour.',
    author: 'OceanBreeze',
    likes: 3200,
    tags: ['ocean', 'sunset', 'relax'],
    createdAt: Date.now() - 3000000,
  },
  {
    id: '4',
    type: MediaType.IMAGE,
    url: 'https://picsum.photos/id/29/1080/1920',
    title: 'Mountain Peak',
    description: 'Snow-capped mountains reaching into the clear blue sky.',
    author: 'PeakSeeker',
    likes: 540,
    tags: ['mountain', 'snow', 'adventure'],
    createdAt: Date.now() - 4000000,
  }
];

export const getWallpapers = (): Wallpaper[] => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const saveWallpaper = (wallpaper: Wallpaper): void => {
  const wallpapers = getWallpapers();
  wallpapers.unshift(wallpaper);
  localStorage.setItem(DB_KEY, JSON.stringify(wallpapers));
};

export const deleteWallpaper = (id: string): void => {
  const wallpapers = getWallpapers();
  const filtered = wallpapers.filter(w => w.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(filtered));
};

export const updateWallpaper = (id: string, updates: Partial<Wallpaper>): void => {
  const wallpapers = getWallpapers();
  const index = wallpapers.findIndex(w => w.id === id);
  if (index !== -1) {
    wallpapers[index] = { ...wallpapers[index], ...updates };
    localStorage.setItem(DB_KEY, JSON.stringify(wallpapers));
  }
};
