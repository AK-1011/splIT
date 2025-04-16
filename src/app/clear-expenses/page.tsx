'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';

export default function ClearExpensesPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  async function clearExpenses() {
    if (!user) {
      setMessage('You must be logged in to clear expenses');
      return;
    }

    setIsClearing(true);
    setMessage('Clearing expenses...');

    try {
      // Only clear expenses for the current user
      await db.expenses.where('userId').equals(user.id).delete();
      setMessage('All expenses have been cleared successfully!');
    } catch (error) {
      console.error('Error clearing expenses:', error);
      setMessage('Error clearing expenses. See console for details.');
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold">Clear Expenses</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Clear All Your Expenses</h2>
            <p className="text-sm text-gray-400 mb-4">
              This will permanently delete all expenses associated with your account. This action cannot be undone.
            </p>

            {message && (
              <div className={`p-3 mb-4 rounded-md ${message.includes('Error') ? 'bg-red-900/30 text-red-200' : 'bg-green-900/30 text-green-200'}`}>
                {message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={clearExpenses}
                className="btn btn-danger"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear All Expenses'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 