'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { nanoid } from 'nanoid';

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [splTAG, setSplTAG] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  // Get all friends from the database
  const friends = useLiveQuery(() => {
    if (user) {
      return db.friends.where('userId').equals(user.id).toArray();
    }
    return [];
  }, [user]);

  // Get all users from the database for username validation
  const allUsers = useLiveQuery(() => {
    return db.users.toArray();
  }, []);

  useEffect(() => {
    async function calculateBalances() {
      if (!friends || !user) return;
      
      // Get all expenses
      const expenses = await db.expenses.where('userId').equals(user.id).toArray();
      const balanceData: Record<string, number> = {};

      // Initialize balances for all friends
      friends.forEach(friend => {
        balanceData[friend.name] = 0;
      });

      // Calculate balances for each expense
      expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        const totalAmount = expense.amount;

        // Add the full amount to the person who paid
        if (balanceData[paidBy] !== undefined) {
          balanceData[paidBy] += totalAmount;
        }

        // Subtract each participant's share
        expense.participants.forEach(participant => {
          const participantShare = (totalAmount * participant.share) / 100;
          if (balanceData[participant.name] !== undefined) {
            balanceData[participant.name] -= participantShare;
          }
        });
      });

      setBalances(balanceData);
    }

    if (friends && friends.length > 0 && user) {
      calculateBalances();
    }
  }, [friends, user]);

  async function createFriend(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!splTAG.trim() || !user) {
      setError('#splTAG is required');
      return;
    }
    
    // Check if a friend with this splTAG already exists
    const existingFriend = friends?.find(
      f => f.name.toLowerCase() === splTAG.trim().toLowerCase()
    );
    
    if (existingFriend) {
      setError('You already have this friend added');
      return;
    }
    
    // Verify the splTAG exists in the users database
    const existingUser = allUsers?.find(
      u => u.name.toLowerCase() === splTAG.trim().toLowerCase()
    );
    
    if (!existingUser) {
      setError('User with this #splTAG does not exist');
      return;
    }
    
    // Don't allow adding yourself as a friend
    if (existingUser.id === user.id) {
      setError('You cannot add yourself as a friend');
      return;
    }
    
    setIsCreating(true);
    
    try {
      await db.friends.add({
        id: nanoid(),
        name: existingUser.name,
        email: existingUser.email,
        createdAt: new Date().toISOString(),
        userId: user.id
      });
      
      setSplTAG('');
    } catch (error) {
      console.error('Error creating friend:', error);
      setError('Failed to add friend');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold">Friends</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Add a Friend</h2>
            <form onSubmit={createFriend} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div>
                <label htmlFor="splTAG" className="block text-sm font-medium mb-1">
                  #splTAG (username)
                </label>
                <input
                  type="text"
                  id="splTAG"
                  value={splTAG}
                  onChange={(e) => setSplTAG(e.target.value)}
                  placeholder="Enter friend's #splTAG"
                  className="input w-full"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can only add users who already have an account
                </p>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isCreating || !splTAG.trim()}
              >
                {isCreating ? 'Adding...' : 'Add Friend'}
              </button>
            </form>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
            
            {!friends || friends.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-2">
                  You haven't added any friends yet.
                </p>
                <p className="text-sm text-gray-500">
                  Add friends using their #splTAG to split expenses with them.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="py-3 flex justify-between items-center hover:bg-gray-800 px-2 rounded"
                  >
                    <div>
                      <span className="block">{friend.name}</span>
                      {friend.email && (
                        <span className="text-xs text-gray-400">{friend.email}</span>
                      )}
                    </div>
                    <div>
                      {balances[friend.name] !== undefined && (
                        <span className={`font-medium ${balances[friend.name] > 0 ? 'text-success' : balances[friend.name] < 0 ? 'text-error' : ''}`}>
                          {balances[friend.name] > 0 
                            ? `Gets back ${formatCurrency(balances[friend.name])}` 
                            : balances[friend.name] < 0 
                              ? `Owes ${formatCurrency(Math.abs(balances[friend.name]))}` 
                              : 'Settled up'}
                        </span>
                      )}
                      <span className="text-gray-400 text-sm block text-right">
                        {new Date(friend.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 