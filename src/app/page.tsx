'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { FaPlus, FaMoneyBillWave, FaUsers, FaUserFriends, FaCog } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Get expenses data
  const expenses = useLiveQuery(async () => {
    if (!user) return [];
    return await db.expenses.orderBy('date').reverse().limit(5).toArray();
  }, [user]);

  // Get groups data
  const groups = useLiveQuery(async () => {
    if (!user) return [];
    return await db.groups.toArray();
  }, [user]);

  // Calculate total balance
  useEffect(() => {
    if (!expenses) return;
    
    let balance = 0;
    
    expenses.forEach(expense => {
      const userParticipant = expense.participants.find(p => p.id === user?.id);
      
      if (expense.paidBy === user?.id) {
        // User paid this expense
        const userShare = userParticipant ? (expense.amount * userParticipant.share) / 100 : 0;
        balance += (expense.amount - userShare);
      } else if (userParticipant) {
        // User didn't pay but is a participant
        const userShare = (expense.amount * userParticipant.share) / 100;
        balance -= userShare;
      }
    });
    
    setTotalBalance(balance);
  }, [expenses, user]);
  
  if (!user || !expenses || !groups) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 opacity-90">Your Balance</h2>
            <p className="text-3xl font-bold mb-2">
              {totalBalance >= 0 ? 
                `+${formatCurrency(totalBalance)}` : 
                formatCurrency(totalBalance)
              }
            </p>
            <p className="text-sm opacity-80">
              {totalBalance >= 0 ? 
                "You are owed money" : 
                "You owe money"
              }
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/expenses/new')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaPlus className="text-blue-500 text-xl mb-2" />
              <span className="font-medium">Add Expense</span>
            </button>
            
            <button 
              onClick={() => router.push('/activity')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaMoneyBillWave className="text-green-500 text-xl mb-2" />
              <span className="font-medium">Activity</span>
            </button>
            
            <button 
              onClick={() => router.push('/groups')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaUsers className="text-purple-500 text-xl mb-2" />
              <span className="font-medium">Groups</span>
            </button>
            
            <button 
              onClick={() => router.push('/friends')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FaUserFriends className="text-orange-500 text-xl mb-2" />
              <span className="font-medium">Friends</span>
            </button>
          </div>
          
          {/* Recent Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Recent Expenses</h2>
              <Link 
                href="/activity" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {expenses.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No expenses yet
                </div>
              ) : (
                expenses.map(expense => (
                  <div 
                    key={expense.id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    onClick={() => router.push(`/expenses/${expense.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{expense.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${expense.paidBy === user.id ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {expense.paidBy === user.id ? '+' : '-'}
                          {formatCurrency(expense.amount)}
                        </p>
                        {expense.groupId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {groups.find(g => g.id === expense.groupId)?.name || 'Unknown group'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 