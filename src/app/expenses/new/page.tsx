'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import ExpenseForm from '@/components/ExpenseForm';
import { useAuth } from '@/lib/auth';

export default function NewExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const { user } = useAuth();
  const [hasFriends, setHasFriends] = useState(false);
  
  // Check if user has friends
  const friends = useLiveQuery(() => {
    if (user) {
      return db.friends.where('userId').equals(user.id).toArray();
    }
    return [];
  }, [user]);

  useEffect(() => {
    if (friends) {
      setHasFriends(friends.length > 0);
    }
  }, [friends]);

  const handleComplete = () => {
    // If the expense was created from a group page, redirect back to that group
    if (groupId) {
      router.push(`/groups/${groupId}`);
    } else {
      router.push('/activity');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline mr-4"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Add New Expense</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4">
          {!hasFriends ? (
            <div className="card p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">You need friends to split expenses</h2>
              <p className="text-gray-400 mb-6">
                To add an expense, you must first add some friends to split it with.
              </p>
              <button
                onClick={() => router.push('/friends')}
                className="btn btn-primary w-full"
              >
                Add Friends
              </button>
            </div>
          ) : (
            <div className="card">
              <ExpenseForm 
                onComplete={handleComplete} 
                initialGroupId={groupId || undefined} 
                requireFriends={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 