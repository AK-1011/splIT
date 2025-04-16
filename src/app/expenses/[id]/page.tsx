'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { db, Participant } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency } from '@/lib/utils';

export default function ExpenseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const expense = useLiveQuery(
    async () => {
      if (!params.id) return null;
      return await db.expenses.get(params.id);
    },
    [params.id]
  );

  const groups = useLiveQuery(() => db.groups.toArray(), []);
  const users = useLiveQuery(() => db.users.toArray(), []);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading user...</div>;
  }

  if (!expense) {
    return <div className="flex justify-center items-center min-h-screen">Loading expense details...</div>;
  }

  const group = expense.groupId ? groups?.find(g => g.id === expense.groupId) : null;
  
  // Find the user who paid
  const paidByUser = users?.find(u => u.id === expense.paidBy);

  // Calculate each person's monetary share
  const calculateMonetaryShare = (participant: Participant) => {
    return (expense.amount * participant.share) / 100;
  };
  
  const deleteExpense = async () => {
    if (confirmDelete) {
      await db.expenses.delete(expense.id);
      router.push('/activity');
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()} 
          className="mr-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold flex-grow">Expense Details</h1>
        <button 
          onClick={() => router.push(`/expenses/edit/${expense.id}`)}
          className="mr-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FaEdit className="text-xl" />
        </button>
        <button 
          onClick={deleteExpense}
          className={`text-${confirmDelete ? 'red' : 'gray'}-600 hover:text-red-800 dark:text-${confirmDelete ? 'red' : 'gray'}-400 dark:hover:text-red-300`}
        >
          <FaTrash className="text-xl" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{expense.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-lg font-medium">{formatCurrency(expense.amount)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-lg font-medium">{new Date(expense.date).toLocaleDateString()}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid by</p>
            <p className="text-lg font-medium">{paidByUser?.name || 'Unknown'}</p>
          </div>
          
          {group && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
              <p className="text-lg font-medium">{group.name}</p>
            </div>
          )}
        </div>
        
        {expense.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
            <p className="text-md">{expense.notes}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Split details</p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            {expense.participants.map((participant, index) => {
              const participantUser = users?.find(u => u.id === participant.id);
              const monetaryShare = calculateMonetaryShare(participant);
              
              return (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <span>{participantUser?.name || participant.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({participant.share}%)
                    </span>
                  </div>
                  <span className={`font-medium ${participant.id === expense.paidBy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {participant.id === expense.paidBy 
                      ? `+${formatCurrency(expense.amount - monetaryShare)}` 
                      : `-${formatCurrency(monetaryShare)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 