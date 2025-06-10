import { TNXLOG } from "./tnxTypes";

// Interface for a User
export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'banned';
  notifications?: Notification[];
  walletStored?: string;
  emailVerified?: boolean;
  bbcPoints?: number;
  tnxLog?: TNXLOG[];
  collections?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

  // Mock Data for an empty user
export const EMPTY_USER: User = {
  id: '',
  uid: '',
  displayName: '',
  email: '',
  notifications: [],
  role: 'user',
  status: 'active',
  collections: [],
  bbcPoints: 0,
  tnxLog: [],
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  walletStored: '',
};
