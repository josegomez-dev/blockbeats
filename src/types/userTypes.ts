// Interface for a User
export interface User {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    role: 'admin' | 'user' | 'guest'; // Could use an enum for roles too
    status: 'active' | 'inactive' | 'banned'; // Could use an enum for statuses too
    notifications?: Notification[]; // Assuming you have a Notification type defined somewhere
    emailVerified: boolean;
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
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  