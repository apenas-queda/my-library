
export enum ItemType {
  BOOK = 'BOOK',
  COMIC = 'COMIC'
}

export enum ItemStatus {
  READING = 'READING',
  FINISHED = 'FINISHED',
  WISHLIST = 'WISHLIST'
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  joinedAt: number;
}

export interface LibraryItem {
  id: string;
  userId: string; // To associate items with specific profiles if needed
  title: string;
  author: string;
  type: ItemType;
  status: ItemStatus;
  currentProgress: number;
  totalProgress: number;
  coverUrl: string;
  lastUpdated: number;
  rating?: number;
  review?: string;
  notes?: string;
  comments: Comment[];
}

export interface NewItemInput {
  title: string;
  author: string;
  type: ItemType;
  totalProgress: number;
  coverUrl: string;
}
