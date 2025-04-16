'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, Group, Expense } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCurrency } from '@/lib/utils';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get group data
  const group = useLiveQuery(
    async () => {
      try {
        const groupData = await db.groups.get(params.id);
        setIsLoading(false);
        return groupData || null;
      } catch (err) {
        console.error('Error loading group:', err);
        setError('Failed to load group details');
        setIsLoading(false);
        return null;
      }
    },
    [params.id]
  );
  
  // Get group expenses
  const expenses = useLiveQuery(
    async () => {
      if (!group) return [];
      try {
        const expenseData = await db.expenses
          .where('groupId')
          .equals(params.id)
          .toArray();
        
        // Sort by date, newest first
        return expenseData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      } catch (err) {
        console.error('Error loading expenses:', err);
        return [];
      }
    },
    [params.id, group]
  );

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

  // Delete group and navigate back to groups list
  const deleteGroup = async () => {
    if (confirm('Are you sure you want to delete this group? All associated expenses will remain but will be converted to personal expenses.')) {
      try {
        // First update any group expenses to remove group association
        if (expenses && expenses.length > 0) {
          for (const expense of expenses) {
            await db.expenses.update(expense.id, { groupId: undefined });
          }
        }
        
        // Then delete the group
        await db.groups.delete(params.id);
        router.push('/groups');
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert('Failed to delete group');
      }
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card py-8 text-center">
            <p>Loading group details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card py-8 text-center">
            <p className="text-error">{error || 'Group not found'}</p>
            <button
              onClick={() => router.push('/groups')}
              className="mt-4 text-primary hover:underline"
            >
              Go Back to Groups
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary flex items-center hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold mt-2">{group.name}</h1>
          <p className="text-sm text-gray-400">
            Created on {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Group members */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Members ({group.members.length})</h2>
          <div className="flex flex-wrap gap-2">
            {group.members.map(member => (
              <span 
                key={member.id} 
                className="bg-gray-800 rounded-full px-3 py-1 text-sm"
              >
                {member.name}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => router.push(`/groups`)}
              className="text-primary text-sm hover:underline"
            >
              Edit Group
            </button>
            <button
              onClick={deleteGroup}
              className="text-error text-sm hover:underline"
            >
              Delete Group
            </button>
          </div>
        </div>
        
        {/* Group expenses */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <Link 
              href={`/expenses/new?groupId=${group.id}`}
              className="btn btn-primary btn-sm"
            >
              Add Group Expense
            </Link>
          </div>
          
          <div className="space-y-3">
            {!expenses || expenses.length === 0 ? (
              <div className="card py-10">
                <p className="text-center text-gray-400">No expenses yet</p>
                <p className="text-center text-gray-500 text-sm mt-2">
                  Start by adding a group expense
                </p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Paid by: {expense.paidBy}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {expense.participants.length} participants
                      </p>
                    </div>
                  </div>
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-300 mt-2 border-t border-gray-700 pt-2">
                      {expense.notes}
                    </p>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-700">
                    <Link 
                      href={`/expenses/view/${expense.id}`}
                      className="text-primary hover:text-blue-400 text-sm"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/expenses/edit/${expense.id}`}
                      className="text-primary hover:text-blue-400 text-sm"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => deleteExpense(expense.id)} 
                      className="text-error hover:text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 