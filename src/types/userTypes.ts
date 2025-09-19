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
  // Avatar phase tracking
  currentAvatarPhase?: number;
  maxUnlockedPhase?: number;
  availablePhases?: number[];
  // User creations tracking
  totalCreations?: number;
  drawingMachineCreations?: number;
  drumMachineCreations?: number;
  totalXP?: number; // Total XP
  // Robot customization
  robotName?: string; // Custom robot name
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
  currentAvatarPhase: 1,
  maxUnlockedPhase: 1,
  availablePhases: [1],
  totalCreations: 0,
  drawingMachineCreations: 0,
  drumMachineCreations: 0,
  totalXP: 0,
  robotName: 'BEATO', // Default robot name
  createdAt: new Date(),
  updatedAt: new Date(),
  walletStored: '',
};
