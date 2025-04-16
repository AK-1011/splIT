import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';

// Define types
export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: Participant[];
  date: Date;
  groupId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  userId: string;
}

export interface Participant {
  id: string;
  name: string;
  share: number;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  userId: string;
}

export interface Member {
  id: string;
  name: string;
}

export interface Friend {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  authToken?: string;
  lastLogin?: Date;
  displayName?: string;
}

// Define the database
class ExpenseDatabase extends Dexie {
  expenses!: Table<Expense>;
  groups!: Table<Group>;
  users!: Table<User>;
  friends!: Table<Friend>;

  constructor() {
    super('splITDatabase');
    
    this.version(1).stores({
      expenses: 'id, groupId, paidBy, date, synced',
      groups: 'id, name, synced',
      users: 'id, email'
    });
    
    this.version(2).stores({
      expenses: 'id, groupId, paidBy, date, synced',
      groups: 'id, name, synced',
      users: 'id, email',
      friends: 'id, name'
    });

    this.version(3).stores({
      expenses: 'id, groupId, paidBy, date, synced, userId',
      groups: 'id, name, synced, userId',
      users: 'id, email, authToken',
      friends: 'id, name, userId'
    });
    
    this.version(4).stores({
      expenses: 'id, groupId, paidBy, date, synced, userId',
      groups: 'id, name, synced, userId',
      users: 'id, name, email, authToken',
      friends: 'id, name, userId'
    });
  }

  // Function to clear all data
  async clearAllData() {
    await this.expenses.clear();
    await this.groups.clear();
    await this.friends.clear();
    await this.users.clear();
  }

  // Function to authenticate a user
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.users.where('email').equals(email).first();
    
    if (user && user.password === password) {
      // In a real app, use proper password hashing (bcrypt, argon2, etc.)
      // Don't store passwords in plaintext
      const authToken = nanoid();
      const now = new Date();
      
      // Update the user with the new auth token and last login date
      await this.users.update(user.id, {
        authToken,
        lastLogin: now,
        updatedAt: now
      });
      
      return { ...user, authToken, lastLogin: now };
    }
    
    return null;
  }

  // Function to logout a user
  async logoutUser(userId: string) {
    return await this.users.update(userId, { authToken: null });
  }

  // Function to check if a user is logged in
  async isLoggedIn(userId: string, authToken: string): Promise<boolean> {
    const user = await this.users.get(userId);
    return user?.authToken === authToken;
  }
}

// Create and export database instance
export const db = new ExpenseDatabase();

// Helper functions
export async function createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
  const now = new Date();
  const expense: Expense = {
    ...expenseData,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    synced: false
  };
  
  await db.expenses.add(expense);
  return expense.id;
}

export async function createGroup(groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
  const now = new Date();
  const group: Group = {
    ...groupData,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    synced: false
  };
  
  await db.groups.add(group);
  return group.id;
}

export async function getExpensesByGroup(groupId: string): Promise<Expense[]> {
  return await db.expenses.where({ groupId }).toArray();
}

export async function getExpensesByUser(userId: string): Promise<Expense[]> {
  return await db.expenses
    .filter(expense => 
      expense.paidBy === userId || 
      expense.participants.some(p => p.id === userId)
    )
    .toArray();
}

export async function getUnsynced(): Promise<{ expenses: Expense[], groups: Group[] }> {
  const expenses = await db.expenses.where({ synced: false }).toArray();
  const groups = await db.groups.where({ synced: false }).toArray();
  
  return { expenses, groups };
}

export async function markAsSynced(type: 'expense' | 'group', id: string): Promise<void> {
  if (type === 'expense') {
    await db.expenses.update(id, { synced: true, updatedAt: new Date() });
  } else {
    await db.groups.update(id, { synced: true, updatedAt: new Date() });
  }
} 