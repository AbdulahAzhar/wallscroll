
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface Wallpaper {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  description: string;
  author: string;
  likes: number;
  tags: string[];
  createdAt: number;
}

export interface UserState {
  isAdmin: boolean;
}
