'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import ExpenseForm from '@/components/ExpenseForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Get expense data
  const expense = useLiveQuery(
    async () => {
      if (!params.id) return null;
      return await db.expenses.get(params.id);
    },
    [params.id]
  );

  if (!expense) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto flex items-center">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-bold">Edit Expense</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto p-4">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Expense not found or still loading...</p>
              <button 
                onClick={() => router.push('/activity')}
                className="btn btn-primary"
              >
                Back to Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    router.push(`/expenses/${expense.id}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Edit Expense</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <ExpenseForm 
              onComplete={handleComplete}
              initialExpense={expense}
              initialGroupId={expense.groupId}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 