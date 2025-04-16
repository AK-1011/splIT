import { db, User } from './db';

export const initialUsers: User[] = [
  {
    id: 'user-1',
    name: 'ada',
    displayName: 'Adam Smith',
    email: 'adam@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    name: 'bob',
    displayName: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-3',
    name: 'cha',
    displayName: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-4',
    name: 'dav',
    displayName: 'Dave Miller',
    email: 'dave@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-5',
    name: 'eli',
    displayName: 'Elizabeth Taylor',
    email: 'e@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-6',
    name: 'fra',
    displayName: 'Frank Wilson',
    email: 'frank@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Add initial friends for each user
export const initialFriends = [
  // Friends for Adam (user-1)
  {
    id: 'friend-1',
    name: 'bob',
    createdAt: new Date().toISOString(),
    userId: 'user-1'
  },
  {
    id: 'friend-2',
    name: 'cha',
    createdAt: new Date().toISOString(),
    userId: 'user-1'
  },
  {
    id: 'friend-3',
    name: 'dav',
    createdAt: new Date().toISOString(),
    userId: 'user-1'
  },
  // Friends for Bob (user-2)
  {
    id: 'friend-4',
    name: 'ada',
    createdAt: new Date().toISOString(),
    userId: 'user-2'
  },
  {
    id: 'friend-5',
    name: 'cha',
    createdAt: new Date().toISOString(),
    userId: 'user-2'
  },
  {
    id: 'friend-6',
    name: 'eli',
    createdAt: new Date().toISOString(),
    userId: 'user-2'
  },
  // Friends for Charlie (user-3)
  {
    id: 'friend-7',
    name: 'ada',
    createdAt: new Date().toISOString(),
    userId: 'user-3'
  },
  {
    id: 'friend-8',
    name: 'bob',
    createdAt: new Date().toISOString(),
    userId: 'user-3'
  },
  {
    id: 'friend-9',
    name: 'fra',
    createdAt: new Date().toISOString(),
    userId: 'user-3'
  },
  // Friends for Dave (user-4)
  {
    id: 'friend-10',
    name: 'ada',
    createdAt: new Date().toISOString(),
    userId: 'user-4'
  },
  {
    id: 'friend-11',
    name: 'eli',
    createdAt: new Date().toISOString(),
    userId: 'user-4'
  },
  // Friends for E (user-5)
  {
    id: 'friend-12',
    name: 'bob',
    createdAt: new Date().toISOString(),
    userId: 'user-5'
  },
  {
    id: 'friend-13',
    name: 'dav',
    createdAt: new Date().toISOString(),
    userId: 'user-5'
  },
  // Friends for Frank (user-6)
  {
    id: 'friend-14',
    name: 'cha',
    createdAt: new Date().toISOString(),
    userId: 'user-6'
  }
];

export async function initializeDatabase() {
  try {
    // Check if we already have the test users
    const userCount = await db.users.count();
    
    if (userCount === 0) {
      // Only clear data if no users exist
      await db.clearAllData();
      console.log('Initializing database with test users...');
      
      // Add users one by one to avoid bulk constraint errors
      for (const user of initialUsers) {
        await db.users.put(user);
      }
      
      // Add initial friends for each user
      for (const friend of initialFriends) {
        await db.friends.put(friend);
      }
      
      console.log('Database initialized with test users and friends!');
    } else {
      console.log('Database already initialized with users, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function getAllUsers(): Promise<User[]> {
  return await db.users.toArray();
} 