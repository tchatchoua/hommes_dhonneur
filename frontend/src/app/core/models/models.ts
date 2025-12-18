// User models
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
  nextOfKin?: string;
  childrenNames?: string[];
  spouseName?: string;
  dateOfBirth: Date;
  photoUrl?: string;
  role: 'User' | 'Admin';
  authMethod: 'UsernamePassword' | 'Facebook' | 'Google';
  isActive: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  nextOfKin?: string;
  childrenNames?: string[];
  spouseName?: string;
  dateOfBirth: Date;
  photoUrl?: string;
}

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  password?: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: string;
  nextOfKin?: string;
  childrenNames?: string[];
  spouseName?: string;
  role?: string;
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  nextOfKin?: string;
  childrenNames?: string[];
  spouseName?: string;
  dateOfBirth?: Date;
  photoUrl?: string;
}

// Dashboard model
export interface Dashboard {
  totalContributions: number;
  totalDebts: number;
  balance: number;
  recentContributions: Contribution[];
  recentDebts: Debt[];
}

// Contribution models
export interface Contribution {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  date: Date;
  description?: string;
  createdAt: Date;
}

export interface CreateContribution {
  userId: number;
  amount: number;
  categoryId: number;
  date: Date;
  description?: string;
}

export interface UpdateContribution {
  amount?: number;
  categoryId?: number;
  date?: Date;
  description?: string;
}

// Debt models
export interface Debt {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  date: Date;
  dueDate?: Date;
  status: 'Pending' | 'Paid' | 'Overdue';
  description?: string;
  createdAt: Date;
}

export interface CreateDebt {
  userId?: number;
  amount: number;
  categoryId: number;
  date: Date;
  dueDate?: Date;
  description?: string;
}

export interface UpdateDebt {
  amount?: number;
  categoryId?: number;
  date?: Date;
  dueDate?: Date;
  status?: string;
  description?: string;
}

// Category models
export interface Category {
  id: number;
  name: string;
  type: 'Contribution' | 'Debt';
  description?: string;
  isActive: boolean;
}

export interface CreateCategory {
  name: string;
  type: 'Contribution' | 'Debt';
  description?: string;
}

export interface UpdateCategory {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Invitation models
export interface Invitation {
  id: number;
  token: string;
  invitationUrl: string;
  expirationDate: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface CreateInvitation {
  expirationDays?: number;
}

// Notification models
export interface Notification {
  id: number;
  userId: number;
  message: string;
  notificationDate: Date;
  isSent: boolean;
  type: string;
  createdAt: Date;
}

export interface NotificationSettings {
  dayOfMonth?: number;
  dayOfWeek?: string;
  weekOfMonth: number;
  hour: number;
  isEnabled: boolean;
}

export interface UpdateNotificationSettings {
  dayOfMonth?: number;
  dayOfWeek?: string;
  weekOfMonth?: number;
  hour?: number;
  isEnabled?: boolean;
}
