'use client';

import { useState } from 'react';
import { db, Expense } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function ActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'personal' | 'group'>('all');

  const expenses = useLiveQuery(async () => {
    if (!user) return [];
    return await db.expenses.toArray();
  }, [user]);

  const groups = useLiveQuery(async () => {
    return await db.groups.toArray();
  }, []);

  const users = useLiveQuery(async () => {
    return await db.users.toArray();
  }, []);

  if (!expenses || !groups || !users || !user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === 'all') return true;
    if (filter === 'personal') return !expense.groupId;
    if (filter === 'group') return expense.groupId;
    return true;
  });

  // Calculate user's share for each expense
  const expensesWithUserShare = filteredExpenses.map(expense => {
    const userParticipant = expense.participants.find(p => p.id === user.id);
    
    let userShare = 0;
    let netAmount = 0;
    
    if (userParticipant) {
      // Calculate user's monetary share of the expense
      userShare = (expense.amount * userParticipant.share) / 100;
      
      // If the user paid for the expense, they're owed (total - their share)
      if (expense.paidBy === user.id) {
        netAmount = expense.amount - userShare;
      } else {
        // If the user didn't pay, they owe their share
        netAmount = -userShare;
      }
    }
    
    return { 
      ...expense, 
      userShare,
      netAmount 
    };
  });

  const deleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await db.expenses.delete(expenseId);
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Activity</h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'personal' | 'group')}
              className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Expenses</option>
              <option value="personal">Personal Expenses</option>
              <option value="group">Group Expenses</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          <div className="space-y-3">
            {expensesWithUserShare.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
              </div>
            ) : (
              expensesWithUserShare.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  onClick={() => router.push(`/expenses/${expense.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{expense.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid by: {expense.paidBy === user.id ? 'You' : 
                                   users.find(u => u.id === expense.paidBy)?.name || expense.paidBy}
                      </p>
                      {expense.groupId && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Group: {groups?.find((g: { id: string; name: string }) => g.id === expense.groupId)?.name || 'Unknown group'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {expense.netAmount > 0 ? (
                          <span className="text-green-600 dark:text-green-400">+{formatCurrency(expense.netAmount)}</span>
                        ) : expense.netAmount < 0 ? (
                          <span className="text-red-600 dark:text-red-400">-{formatCurrency(Math.abs(expense.netAmount))}</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">$0.00</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total: {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 